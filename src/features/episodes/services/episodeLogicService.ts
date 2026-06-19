
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

    public async saveFullMap(episodeId: number, sceneObjectsArray: any[], triggersArray: any[], worldSettings: any) {
        const transaction = await sequelize.transaction();
        try {
            // 1. Guardar settings globales
            if (worldSettings) {
                await EpisodeModel.update(
                    { worldSettings: worldSettings },
                    { where: { id: episodeId }, transaction }
                );
            }

            // 2. Extraer el estado actual de la base de datos (Solo IDs y UIDs para ser ultrarrápido)
            const existingObjects = await SceneObjectModel.findAll({ attributes: ['id', 'uid'], where: { episodeId }, transaction });
            const existingTriggers = await TriggerModel.findAll({ attributes: ['id', 'uid'], where: { episodeId }, transaction });

            // Diccionarios para cruzar UID del frontend con el ID numérico de la BD
            const existingObjMap = new Map(existingObjects.map(o => [o.getDataValue('uid'), o.getDataValue('id')]));
            const existingTriggerMap = new Map(existingTriggers.map(t => [t.getDataValue('uid'), t.getDataValue('id')]));

            const incomingObjUids = new Set<string>();
            const incomingTriggerUids = new Set<string>();

            // 3. Preparar Objetos (Upsert Format)
            const objectsToUpsert = (sceneObjectsArray || []).map(obj => {
                const finalUid = obj.uid || crypto.randomUUID();
                incomingObjUids.add(finalUid);
                
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
                
                // Si el objeto ya existe en la BD, le inyectamos su Primary Key
                if (existingObjMap.has(finalUid)) {
                    dbObj.id = existingObjMap.get(finalUid);
                }
                
                return dbObj;
            });

            // 4. Preparar Triggers (Upsert Format)
            const triggersToUpsert = (triggersArray || []).map(trigger => {
                const finalUid = trigger.uid || crypto.randomUUID();
                incomingTriggerUids.add(finalUid);
                
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

                // Inyectamos Primary Key si ya existía
                if (existingTriggerMap.has(finalUid)) {
                    dbTrigger.id = existingTriggerMap.get(finalUid);
                }

                return dbTrigger;
            });

            // 5. Detectar qué elementos fueron borrados desde el frontend
            const idsToDeleteObjects = existingObjects
                .filter(o => !incomingObjUids.has(o.getDataValue('uid')))
                .map(o => o.getDataValue('id'));

            const idsToDeleteTriggers = existingTriggers
                .filter(t => !incomingTriggerUids.has(t.getDataValue('uid')))
                .map(t => t.getDataValue('id'));

            // 6. Ejecutar queries en bloque
            
            // A) Borrar lo que ya no existe
            if (idsToDeleteObjects.length > 0) {
                await SceneObjectModel.destroy({ where: { id: idsToDeleteObjects }, transaction });
            }
            if (idsToDeleteTriggers.length > 0) {
                await TriggerModel.destroy({ where: { id: idsToDeleteTriggers }, transaction });
            }

            // B) Upsert (Inserta nuevos o Actualiza los existentes en base a la PK "id")
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
                message: "Mapa guardado eficientemente mediante Deltas", 
                totalObjects: objectsToUpsert.length,
                totalTriggers: triggersToUpsert.length,
                deletedObjects: idsToDeleteObjects.length,
                deletedTriggers: idsToDeleteTriggers.length
            };

        } catch (error) {
            await transaction.rollback();
            console.error("Error guardando el mapa (Upsert):", error);
            throw new Error("No se pudo guardar el mapa");
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