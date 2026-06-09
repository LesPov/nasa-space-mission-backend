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
            dialogueGraph: {} 
        });
        return newEpisode.toJSON();
    }

    public async getEpisodeFullData(episodeId: number) {
        const episode = await EpisodeModel.findByPk(episodeId);
        if (!episode) throw new Error("Episodio no encontrado");

        const sceneObjects = await SceneObjectModel.findAll({ where: { episodeId } });
        const triggers = await TriggerModel.findAll({ where: { episodeId } });

        return {
            episode: episode.toJSON(),
            sceneObjects: sceneObjects.map(obj => obj.toJSON()),
            triggers: triggers.map(t => t.toJSON())
        };
    }

    public async saveFullMap(episodeId: number, sceneObjectsArray: any[]) {
        const transaction = await sequelize.transaction();
        try {
            await SceneObjectModel.destroy({ where: { episodeId }, transaction });

            const objectsToInsert = sceneObjectsArray.map(obj => ({
                episodeId: episodeId,
                type: obj.type,
                name: obj.name,
                position: obj.position,
                rotation: obj.rotation,
                scale: obj.scale,
                properties: obj.properties || {}, // 🔥 Fallback para evitar errores null
                assetId: obj.assetId || null
            }));

            await SceneObjectModel.bulkCreate(objectsToInsert, { transaction });
            await transaction.commit();
            return { message: "Mapa guardado correctamente", totalObjects: objectsToInsert.length };

        } catch (error) {
            await transaction.rollback();
            console.error("Error guardando el mapa:", error);
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