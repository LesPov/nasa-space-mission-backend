import { CinematicModel, SequenceModel, ActionModel, DecisionTreeModel, ConsequenceTreeModel, LoreTreeModel } from "./model/narrativeModels";
import { PlaythroughModel } from "./model/playthroughModel";
import { PlayerSceneStateModel } from "./model/playerSceneStateModel";
import { SceneModel } from "../scenes/models/sceneModel";
import { EpisodeModel } from "../episodes/models/episodeModel";
import { EpisodeVersionModel } from "../episodes/models/episodeVersionModel";
import { AuthModel } from "../auth/models/authModel";

export const registerNarrativeAssociations = () => {
    // Relación Global de Lore
    EpisodeModel.hasOne(LoreTreeModel, { foreignKey: 'episodeId', onDelete: 'CASCADE' });
    LoreTreeModel.belongsTo(EpisodeModel, { foreignKey: 'episodeId' });

    // Cinemáticas y Secuencias (Pertenecen a una Escena)
    SceneModel.hasMany(CinematicModel, { foreignKey: 'sceneId', onDelete: 'CASCADE' });
    CinematicModel.belongsTo(SceneModel, { foreignKey: 'sceneId' });

    SceneModel.hasMany(SequenceModel, { foreignKey: 'sceneId', onDelete: 'CASCADE' });
    SequenceModel.belongsTo(SceneModel, { foreignKey: 'sceneId' });

    SequenceModel.hasMany(ActionModel, { foreignKey: 'sequenceId', onDelete: 'CASCADE' });
    ActionModel.belongsTo(SequenceModel, { foreignKey: 'sequenceId' });

    // Árboles de Diálogo / Decisiones
    SceneModel.hasMany(DecisionTreeModel, { foreignKey: 'sceneId', onDelete: 'CASCADE' });
    DecisionTreeModel.belongsTo(SceneModel, { foreignKey: 'sceneId' });

    DecisionTreeModel.hasMany(ConsequenceTreeModel, { foreignKey: 'decisionTreeId', onDelete: 'CASCADE' });
    ConsequenceTreeModel.belongsTo(DecisionTreeModel, { foreignKey: 'decisionTreeId' });

    // Motor de Estado y Progreso del Jugador (Playthroughs)
    AuthModel.hasMany(PlaythroughModel, { foreignKey: 'userId', as: 'playthroughs', onDelete: 'CASCADE' });
    PlaythroughModel.belongsTo(AuthModel, { foreignKey: 'userId' });

    EpisodeVersionModel.hasMany(PlaythroughModel, { foreignKey: 'episodeVersionId', onDelete: 'CASCADE' });
    PlaythroughModel.belongsTo(EpisodeVersionModel, { foreignKey: 'episodeVersionId' });

    PlaythroughModel.hasMany(PlayerSceneStateModel, { foreignKey: 'playthroughId', onDelete: 'CASCADE' });
    PlayerSceneStateModel.belongsTo(PlaythroughModel, { foreignKey: 'playthroughId' });

    SceneModel.hasMany(PlayerSceneStateModel, { foreignKey: 'sceneId', onDelete: 'CASCADE' });
    PlayerSceneStateModel.belongsTo(SceneModel, { foreignKey: 'sceneId' });
};