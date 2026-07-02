
import { EpisodeModel } from '../models/episodeModel';
import { EpisodeVersionModel } from '../models/episodeVersionModel';
import { SceneModel } from '../models/sceneModel';
import { SceneObjectModel } from '../models/sceneObjectModel';
import { TriggerModel } from '../models/triggerModel';
import { SceneConnectionModel } from '../models/sceneConnectionModel';
import { CinematicModel } from '../models/narrativeModels';
import sequelize from '../../../infrastructure/database/config';
import crypto from 'crypto';

class EpisodeLogicService {
    
    public async getAllEpisodes() {
        const episodes = await EpisodeModel.findAll({
            order: [['createdAt', 'DESC']]
        });
        return episodes.map(epi => epi.toJSON());
    }

    public async createEpisode(data: { title: string; description?: string }, authorId: number) {
        const transaction = await sequelize.transaction();
        try {
            const newEpisode = await EpisodeModel.create({
                title: data.title,
                description: data.description || '',
                authorId: authorId,
            }, { transaction });

            const newVersion = await EpisodeVersionModel.create({
                episodeId: newEpisode.getDataValue('id'),
                versionNumber: 1,
                status: 'DRAFT' as any,
                changelog: 'Initial Creation'
            }, { transaction });

            const initialScene = await SceneModel.create({
                episodeVersionId: newVersion.getDataValue('id'),
                name: 'Main Platform',
                environmentSettings: {},
                spawnPoint: { x: 0, y: 0, z: 0 },
                isInitialScene: true
            }, { transaction });

            await transaction.commit();
            return {
                episode: newEpisode.toJSON(),
                version: newVersion.toJSON(),
                initialScene: initialScene.toJSON()
            };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    public async getScenesByEpisode(episodeId: number) {
        const version = await EpisodeVersionModel.findOne({ where: { episodeId, status: 'DRAFT' } });
        if (!version) throw new Error("Versión DRAFT no encontrada");
        const scenes = await SceneModel.findAll({ 
            where: { episodeVersionId: version.getDataValue('id') },
            order: [['createdAt', 'ASC']]
        });
        return scenes.map(s => s.toJSON());
    }

    public async createScene(episodeId: number, name: string) {
        const version = await EpisodeVersionModel.findOne({ where: { episodeId, status: 'DRAFT' } });
        if (!version) throw new Error("Versión DRAFT no encontrada");
        const newScene = await SceneModel.create({
            episodeVersionId: version.getDataValue('id'),
            name: name,
            environmentSettings: {},
            spawnPoint: { x: 0, y: 0, z: 0 },
            isInitialScene: false
        });
        return newScene.toJSON();
    }

    public async getSceneFullData(sceneId: number) {
        const scene = await SceneModel.findByPk(sceneId);
        if (!scene) throw new Error("Escena/Plataforma no encontrada");

        const sceneObjects = await SceneObjectModel.findAll({ where: { sceneId } });
        const triggers = await TriggerModel.findAll({ where: { sceneId } });
        const connections = await SceneConnectionModel.findAll({ where: { sourceSceneId: sceneId } });
        const cinematics = await CinematicModel.findAll({ where: { sceneId } });

        return {
            scene: scene.toJSON(),
            sceneObjects: sceneObjects.map(obj => obj.toJSON()),
            triggers: triggers.map(t => t.toJSON()),
            connections: connections.map(c => c.toJSON()),
            cinematics: cinematics.map(c => c.toJSON())
        };
    }

   public async saveSceneMap(
       sceneId: number, 
       sceneObjectsDelta: any[], 
       triggersDelta: any[], 
       cinematicsDelta: any[], 
       deletedObjects: string[], 
       deletedTriggers: string[], 
       deletedCinematics: string[], 
       environmentSettings: any, 
       spawnPoint: any
    ) {
        const transaction = await sequelize.transaction();
        try {
            const updateData: any = {};
            if (environmentSettings) updateData.environmentSettings = environmentSettings;
            if (spawnPoint) updateData.spawnPoint = spawnPoint; 

            if (Object.keys(updateData).length > 0) {
                await SceneModel.update(updateData, { where: { id: sceneId }, transaction });
            }

            if (deletedObjects.length > 0) {
                await SceneObjectModel.destroy({ where: { sceneId, uid: deletedObjects }, transaction });
            }
            if (deletedTriggers.length > 0) {
                await TriggerModel.destroy({ where: { sceneId, uid: deletedTriggers }, transaction });
            }
            if (deletedCinematics.length > 0) {
                await CinematicModel.destroy({ where: { sceneId, uid: deletedCinematics }, transaction });
            }

            const incomingObjUids = sceneObjectsDelta.map(o => o.uid).filter(Boolean);
            const incomingTriggerUids = triggersDelta.map(t => t.uid).filter(Boolean);
            const incomingCinUids = cinematicsDelta.map(c => c.uid || c.id).filter(Boolean);

            let existingObjMap = new Map();
            let existingTriggerMap = new Map();
            let existingCinematicMap = new Map();

            if (incomingObjUids.length > 0) {
                const existingObjects = await SceneObjectModel.findAll({ attributes: ['id', 'uid'], where: { sceneId, uid: incomingObjUids }, transaction });
                existingObjMap = new Map(existingObjects.map(o => [o.getDataValue('uid'), o.getDataValue('id')]));
            }

            if (incomingTriggerUids.length > 0) {
                const existingTriggers = await TriggerModel.findAll({ attributes: ['id', 'uid'], where: { sceneId, uid: incomingTriggerUids }, transaction });
                existingTriggerMap = new Map(existingTriggers.map(t => [t.getDataValue('uid'), t.getDataValue('id')]));
            }

            if (incomingCinUids.length > 0) {
                const existingCins = await CinematicModel.findAll({ attributes: ['id', 'uid'], where: { sceneId, uid: incomingCinUids }, transaction });
                existingCinematicMap = new Map(existingCins.map(c => [c.getDataValue('uid'), c.getDataValue('id')]));
            }

            const objectsToUpsert = (sceneObjectsDelta || []).map(obj => {
                const finalUid = obj.uid || crypto.randomUUID();
                const dbObj: any = {
                    sceneId: sceneId,
                    uid: finalUid,
                    type: obj.type,
                    name: obj.name,
                    parentId: obj.parentId || null,
                    position: obj.position,
                    rotation: obj.rotation,
                    scale: obj.scale,
                    properties: obj.properties || {},
                    assetId: obj.assetId || null
                };
                if (existingObjMap.has(finalUid)) dbObj.id = existingObjMap.get(finalUid);
                return dbObj;
            });

            const triggersToUpsert = (triggersDelta || []).map(trigger => {
                const finalUid = trigger.uid || crypto.randomUUID();
                const dbTrigger: any = {
                    sceneId: sceneId,
                    uid: finalUid,
                    name: trigger.name,
                    parentId: trigger.parentId || null,
                    position: trigger.position,
                    size: trigger.scale || trigger.size,
                    
                    // 🔥 FIX: EXTRAEMOS EXPLICÍTAMENTE LA ROTACIÓN DEL OBJETO Y/O PROPIEDADES (Failsafe)
                    rotation: trigger.rotation || trigger.properties?.rotation || { x: 0, y: 0, z: 0 },
                    
                    condition: trigger.properties?.condition || trigger.condition || 'on_enter',
                    actionType: trigger.properties?.actionType || trigger.actionType || 'show_message',
                    targetObjectName: trigger.properties?.targetObjectName || trigger.targetObjectName || '',
                    actionProperties: trigger.properties || trigger.actionProperties || {},
                    isRepeatable: trigger.properties?.isRepeatable ?? trigger.isRepeatable ?? false,
                    isEnabled: trigger.properties?.isEnabled ?? trigger.isEnabled ?? true
                };
                if (existingTriggerMap.has(finalUid)) dbTrigger.id = existingTriggerMap.get(finalUid);
                return dbTrigger;
            });

            const cinematicsToUpsert = (cinematicsDelta || []).map(cin => {
                const finalUid = cin.uid || cin.id || crypto.randomUUID();
                const dbCin: any = {
                    sceneId: sceneId,
                    uid: finalUid,
                    name: cin.name,
                    durationMs: cin.durationMs,
                    tracks: cin.tracks || []
                };
                if (existingCinematicMap.has(finalUid)) dbCin.id = existingCinematicMap.get(finalUid);
                return dbCin;
            });

            if (objectsToUpsert.length > 0) {
                await SceneObjectModel.bulkCreate(objectsToUpsert, { 
                    updateOnDuplicate: ['type', 'name', 'parentId', 'position', 'rotation', 'scale', 'properties', 'assetId'], 
                    transaction 
                });
            }
            if (triggersToUpsert.length > 0) {
                await TriggerModel.bulkCreate(triggersToUpsert, { 
                    // 🔥 FIX: AÑADIDA LA 'rotation' A LA LISTA DE ACTUALIZACIÓN EN CASO DE DUPLICADO
                    updateOnDuplicate: ['name', 'parentId', 'position', 'size', 'rotation', 'condition', 'actionType', 'targetObjectName', 'actionProperties', 'isRepeatable', 'isEnabled'], 
                    transaction 
                });
            }
            if (cinematicsToUpsert.length > 0) {
                await CinematicModel.bulkCreate(cinematicsToUpsert, {
                    updateOnDuplicate: ['name', 'durationMs', 'tracks'],
                    transaction
                });
            }

            await transaction.commit();
            
            return { 
                message: "Plataforma/Escena guardada exitosamente", 
                upsertedObjects: objectsToUpsert.length,
                upsertedTriggers: triggersToUpsert.length,
                upsertedCinematics: cinematicsToUpsert.length
            };

        } catch (error) {
            await transaction.rollback();
            console.error("Error guardando escena:", error);
            throw new Error("No se pudo guardar la plataforma/escena de forma incremental");
        }
    }
}

export default new EpisodeLogicService();