
import { EpisodeModel } from '../models/episodeModel';
import { EpisodeVersionModel } from '../models/episodeVersionModel';
import { NarrativeRoleModel } from '../models/narrativeRoleModel';
import { PrefabModel } from '../../prefabs/models/prefabModel';
import sequelize from '../../../infrastructure/database/config';
import { SceneModel } from '../../scenes/models/sceneModel';

class EpisodeLogicService {
    public async getAllEpisodes() {
        const episodes = await EpisodeModel.findAll({ 
            order: [['createdAt', 'DESC']],
            include: [{ 
                model: NarrativeRoleModel, 
                as: 'narrativeRoles',
                include: [{ model: PrefabModel, as: 'characterPrefab' }]
            }]
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

    // 🔥 NUEVO MÉTODO PARA GUARDAR METADATA GENERAL DEL EPISODIO
    public async updateEpisode(episodeId: number, data: { title: string; description?: string }) {
        const episode = await EpisodeModel.findByPk(episodeId);
        if (!episode) throw new Error("Episodio no encontrado");

        await episode.update(data);
        return episode.toJSON();
    }
}
export default new EpisodeLogicService();