import { EpisodeModel } from '../models/episodeModel';
import { SceneObjectModel } from '../models/sceneObjectModel';
import { TriggerModel } from '../models/triggerModel';
import sequelize from '../../../infrastructure/database/config';

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
            worldSettings: {} // 🔥 Inicializamos el mundo vacío
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
            // 🔥 Se lo enviamos al Frontend directo para que cargue la iluminación y gravedad
            worldSettings: episodeData.worldSettings || {} 
        };
    }

    // 🔥 ACTUALIZADO PARA RECIBIR WORLDSETTINGS Y GUARDARLO
    public async saveFullMap(episodeId: number, sceneObjectsArray: any[], triggersArray: any[], worldSettings: any) {
        const transaction = await sequelize.transaction();
        try {
            // 🔥 Actualizar el episodio con la configuración Global del Mundo
            if (worldSettings) {
                await EpisodeModel.update(
                    { worldSettings: worldSettings },
                    { where: { id: episodeId }, transaction }
                );
            }

            // 1. Limpiamos el mapa actual
            await SceneObjectModel.destroy({ where: { episodeId }, transaction });
            await TriggerModel.destroy({ where: { episodeId }, transaction });

            // 2. Preparamos los objetos de escena
            const objectsToInsert = (sceneObjectsArray || []).map(obj => ({
                episodeId: episodeId,
                type: obj.type,
                name: obj.name,
                position: obj.position,
                rotation: obj.rotation,
                scale: obj.scale,
                properties: obj.properties || {},
                assetId: obj.assetId || null
            }));

            // 3. Preparamos los Triggers
            const triggersToInsert = (triggersArray || []).map(trigger => ({
                episodeId: episodeId,
                name: trigger.name,
                position: trigger.position,
                size: trigger.scale, // Usamos la escala como tamaño de la caja
                condition: trigger.properties?.condition || 'on_enter',
                actionType: trigger.properties?.actionType || 'show_message',
                targetObjectName: trigger.properties?.targetObjectName || '',
                actionProperties: trigger.properties || {},
                isRepeatable: trigger.properties?.isRepeatable ?? false,
                isEnabled: trigger.properties?.isEnabled ?? true
            }));

            // 4. Inserción masiva
            if (objectsToInsert.length > 0) {
                await SceneObjectModel.bulkCreate(objectsToInsert, { transaction });
            }
            if (triggersToInsert.length > 0) {
                await TriggerModel.bulkCreate(triggersToInsert, { transaction });
            }
            
            await transaction.commit();
            return { 
                message: "Mapa, Triggers y Entorno guardados correctamente", 
                totalObjects: objectsToInsert.length,
                totalTriggers: triggersToInsert.length
            };

        } catch (error) {
            await transaction.rollback();
            console.error("Error guardando el mapa, entorno y los triggers:", error);
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