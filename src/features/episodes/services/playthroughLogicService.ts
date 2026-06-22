import { PlaythroughModel } from '../models/playthroughModel';
import { PlayerSceneStateModel } from '../models/playerSceneStateModel';
import { SceneModel } from '../models/sceneModel';
import { SceneConnectionModel } from '../models/sceneConnectionModel';
import { EpisodeVersionModel } from '../models/episodeVersionModel';
 import { AppError } from '../../../infrastructure/errors/app.error';
import sequelize from '../../../infrastructure/database/config';
import { SceneProgressStatus } from '../interfaces/enums';
 
class PlaythroughLogicService {
    
    public async startPlaythrough(userId: number, episodeVersionId: number) {
        const transaction = await sequelize.transaction();
        try {
            const version = await EpisodeVersionModel.findByPk(episodeVersionId, { transaction });
            if (!version) throw new AppError("Versión de episodio no encontrada", 404);

            const initialScene = await SceneModel.findOne({
                where: { episodeVersionId, isInitialScene: true },
                transaction
            });

            if (!initialScene) throw new AppError("El episodio no tiene una escena inicial configurada", 400);

            const playthrough = await PlaythroughModel.create({
                userId,
                episodeVersionId,
                currentSceneId: initialScene.getDataValue('id'),
                globalFlags: {},
                inventory: []
            }, { transaction });

            await PlayerSceneStateModel.create({
                playthroughId: playthrough.getDataValue('id'),
                sceneId: initialScene.getDataValue('id'),
                status: SceneProgressStatus.ACTIVE
            }, { transaction });

            await transaction.commit();
            return playthrough.toJSON();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    public async processEvent(userId: number, playthroughId: number, event: { action: string, payload: any }) {
        const transaction = await sequelize.transaction();
        try {
            const playthrough = await PlaythroughModel.findOne({ where: { id: playthroughId, userId }, transaction });
            if (!playthrough) throw new AppError("Partida no encontrada o no autorizada", 404);

            let responsePayload = { message: "Evento procesado", updatedState: {} };

            switch (event.action) {
                case 'REQUEST_SCENE_TRANSITION':
                    const { connectionId } = event.payload;
                    const connection = await SceneConnectionModel.findByPk(connectionId, { transaction });
                    
                    if (!connection || connection.getDataValue('sourceSceneId') !== playthrough.getDataValue('currentSceneId')) {
                        throw new AppError("Transición no válida desde la escena actual", 400);
                    }

                    // TODO Futuro: Validar connection.requiredConditionId contra playthrough.globalFlags

                    // Marcar escena actual como completada
                    await PlayerSceneStateModel.update(
                        { status: SceneProgressStatus.COMPLETED },
                        { where: { playthroughId, sceneId: playthrough.getDataValue('currentSceneId') }, transaction }
                    );

                    // Mover al jugador a la nueva escena
                    const targetSceneId = connection.getDataValue('targetSceneId');
                    playthrough.set('currentSceneId', targetSceneId);
                    await playthrough.save({ transaction });

                    // Activar la nueva escena (crear o actualizar)
                    await PlayerSceneStateModel.upsert({
                        playthroughId,
                        sceneId: targetSceneId,
                        status: SceneProgressStatus.ACTIVE
                    }, { transaction });

                    responsePayload.message = "Transición autorizada";
                    responsePayload.updatedState = { currentSceneId: targetSceneId };
                    break;

                case 'MUTATE_FLAG':
                    // TODO Futuro: Lógica para registrar decisiones del árbol narrativo
                    break;

                default:
                    throw new AppError("Acción de evento desconocida", 400);
            }

            await transaction.commit();
            return responsePayload;

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    public async getPlaythroughState(userId: number, playthroughId: number) {
        const playthrough = await PlaythroughModel.findOne({ where: { id: playthroughId, userId } });
        if (!playthrough) throw new AppError("Partida no encontrada", 404);

        const sceneStates = await PlayerSceneStateModel.findAll({ where: { playthroughId } });

        return {
            playthrough: playthrough.toJSON(),
            sceneStates: sceneStates.map(s => s.toJSON())
        };
    }
}

export default new PlaythroughLogicService();