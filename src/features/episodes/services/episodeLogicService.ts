
import { EpisodeModel } from '../models/episodeModel';
import { SceneObjectModel } from '../models/sceneObjectModel';
import { TriggerModel } from '../models/triggerModel';
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
        const newEpisode = await EpisodeModel.create({
            title: data.title,
            description: data.description || '',
            authorId: authorId,
            isPublished: false,
            dialogueGraph: {},
            worldSettings: {}
        });
        return newEpisode.toJSON();
    }

    public async getEpisodeFullData(episodeId: number) {
        const episode = await EpisodeModel.findByPk(episodeId);
        if (!episode) throw new Error("Episodio no encontrado");

        const sceneObjects = await SceneObjectModel.findAll({ where: { episodeId } });
        const triggers = await TriggerModel.findAll({ where: { episodeId } });

        const episodeData = episode.toJSON() as any;

        return {
            episode: episodeData,
            sceneObjects: sceneObjects.map(obj => obj.toJSON()),
            triggers: triggers.map(t => t.toJSON()),
            worldSettings: episodeData.worldSettings || {} 
        };
    }

    public async saveFullMap(episodeId: number, sceneObjectsDelta: any[], triggersDelta: any[], deletedObjects: string[], deletedTriggers: string[], worldSettings: any) {
        const transaction = await sequelize.transaction();
        try {
            // 1. Guardar settings globales
            if (worldSettings) {
                await EpisodeModel.update(
                    { worldSettings: worldSettings },
                    { where: { id: episodeId }, transaction }
                );
            }

            // 2. Ejecutar Eliminaciones Explícitas primero (para evitar colisiones de IDs si se recrean)
            if (deletedObjects.length > 0) {
                await SceneObjectModel.destroy({ where: { episodeId, uid: deletedObjects }, transaction });
            }
            if (deletedTriggers.length > 0) {
                await TriggerModel.destroy({ where: { episodeId, uid: deletedTriggers }, transaction });
            }

            // 3. Extraer IDs numéricos solo de los UIDs que vienen en el Delta
            const incomingObjUids = sceneObjectsDelta.map(o => o.uid).filter(Boolean);
            const incomingTriggerUids = triggersDelta.map(t => t.uid).filter(Boolean);

            let existingObjMap = new Map();
            let existingTriggerMap = new Map();

            if (incomingObjUids.length > 0) {
                const existingObjects = await SceneObjectModel.findAll({ attributes: ['id', 'uid'], where: { episodeId, uid: incomingObjUids }, transaction });
                existingObjMap = new Map(existingObjects.map(o => [o.getDataValue('uid'), o.getDataValue('id')]));
            }

            if (incomingTriggerUids.length > 0) {
                const existingTriggers = await TriggerModel.findAll({ attributes: ['id', 'uid'], where: { episodeId, uid: incomingTriggerUids }, transaction });
                existingTriggerMap = new Map(existingTriggers.map(t => [t.getDataValue('uid'), t.getDataValue('id')]));
            }

            // 4. Preparar Objetos para Upsert
            const objectsToUpsert = (sceneObjectsDelta || []).map(obj => {
                const finalUid = obj.uid || crypto.randomUUID();
                const dbObj: any = {
                    episodeId: episodeId,
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
                if (existingObjMap.has(finalUid)) {
                    dbObj.id = existingObjMap.get(finalUid);
                }
                return dbObj;
            });

            // 5. Preparar Triggers para Upsert
            const triggersToUpsert = (triggersDelta || []).map(trigger => {
                const finalUid = trigger.uid || crypto.randomUUID();
                const dbTrigger: any = {
                    episodeId: episodeId,
                    uid: finalUid,
                    name: trigger.name,
                    parentId: trigger.parentId || null,
                    position: trigger.position,
                    size: trigger.scale || trigger.size,
                    condition: trigger.properties?.condition || trigger.condition || 'on_enter',
                    actionType: trigger.properties?.actionType || trigger.actionType || 'show_message',
                    targetObjectName: trigger.properties?.targetObjectName || trigger.targetObjectName || '',
                    actionProperties: trigger.properties || trigger.actionProperties || {},
                    isRepeatable: trigger.properties?.isRepeatable ?? trigger.isRepeatable ?? false,
                    isEnabled: trigger.properties?.isEnabled ?? trigger.isEnabled ?? true
                };
                if (existingTriggerMap.has(finalUid)) {
                    dbTrigger.id = existingTriggerMap.get(finalUid);
                }
                return dbTrigger;
            });

            // 6. Ejecutar Upserts Masivos (Ahora solo sobre lo modificado)
            if (objectsToUpsert.length > 0) {
                await SceneObjectModel.bulkCreate(objectsToUpsert, { 
                    updateOnDuplicate: ['type', 'name', 'parentId', 'position', 'rotation', 'scale', 'properties', 'assetId'], 
                    transaction 
                });
            }
            
            if (triggersToUpsert.length > 0) {
                await TriggerModel.bulkCreate(triggersToUpsert, { 
                    updateOnDuplicate: ['name', 'parentId', 'position', 'size', 'condition', 'actionType', 'targetObjectName', 'actionProperties', 'isRepeatable', 'isEnabled'], 
                    transaction 
                });
            }

            await transaction.commit();
            
            return { 
                message: "Mapa guardado eficientemente mediante Deltas Estrictos", 
                upsertedObjects: objectsToUpsert.length,
                upsertedTriggers: triggersToUpsert.length,
                deletedObjects: deletedObjects.length,
                deletedTriggers: deletedTriggers.length
            };

        } catch (error) {
            await transaction.rollback();
            console.error("Error guardando el mapa (Upsert Parcial):", error);
            throw new Error("No se pudo guardar el mapa de forma incremental");
        }
    }

    public async saveDialogueGraph(episodeId: number, dialogueJson: any) {
        const episode = await EpisodeModel.findByPk(episodeId);
        if (!episode) throw new Error("Episodio no encontrado"); 

        await episode.update({ dialogueGraph: dialogueJson });
        return { message: "Historia y diálogos guardados." };
    }
}

export default new EpisodeLogicService();