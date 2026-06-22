import sequelize from "./config";

import { AuthModel } from "../../features/auth/models/authModel";
import { VerificationModel } from "../../features/auth/models/verificationModel";
import { AssetModel } from "../../features/episodes/models/assetModel";
import { EpisodeModel } from "../../features/episodes/models/episodeModel";
import { EpisodeVersionModel } from "../../features/episodes/models/episodeVersionModel";
import { SceneModel } from "../../features/episodes/models/sceneModel";
import { SceneConnectionModel } from "../../features/episodes/models/sceneConnectionModel";
import { SceneObjectModel } from "../../features/episodes/models/sceneObjectModel";
import { TriggerModel } from "../../features/episodes/models/triggerModel";
import { PlaythroughModel } from "../../features/episodes/models/playthroughModel";
import { PlayerSceneStateModel } from "../../features/episodes/models/playerSceneStateModel";
import { CinematicModel, SequenceModel, ActionModel, DecisionTreeModel, ConsequenceTreeModel, LoreTreeModel } from "../../features/episodes/models/narrativeModels";
import { userProfileModel } from "../../features/profiles/models/userProfileModel";
import { PrefabModel } from "../../features/episodes/models/prefabModel"; 

export const defineDatabaseAssociations = () => {
    // Auth & Profiles
    AuthModel.hasOne(userProfileModel, { foreignKey: 'userId', as: 'profile', onDelete: 'CASCADE' });
    userProfileModel.belongsTo(AuthModel, { foreignKey: 'userId' });
    AuthModel.hasOne(VerificationModel, { foreignKey: 'userId', as: 'verification', onDelete: 'CASCADE' });
    VerificationModel.belongsTo(AuthModel, { foreignKey: 'userId' });

    // Episodes & Versions
    AuthModel.hasMany(EpisodeModel, { foreignKey: 'authorId', as: 'createdEpisodes' });
    EpisodeModel.belongsTo(AuthModel, { as: 'author', foreignKey: 'authorId' });
    
    EpisodeModel.hasMany(EpisodeVersionModel, { foreignKey: 'episodeId', onDelete: 'CASCADE' });
    EpisodeVersionModel.belongsTo(EpisodeModel, { foreignKey: 'episodeId' });

    EpisodeModel.hasOne(LoreTreeModel, { foreignKey: 'episodeId', onDelete: 'CASCADE' });
    LoreTreeModel.belongsTo(EpisodeModel, { foreignKey: 'episodeId' });

    // Scenes (Plataformas)
    EpisodeVersionModel.hasMany(SceneModel, { foreignKey: 'episodeVersionId', onDelete: 'CASCADE' });
    SceneModel.belongsTo(EpisodeVersionModel, { foreignKey: 'episodeVersionId' });

    SceneModel.hasMany(SceneConnectionModel, { foreignKey: 'sourceSceneId', as: 'outgoingConnections', onDelete: 'CASCADE' });
    SceneConnectionModel.belongsTo(SceneModel, { foreignKey: 'sourceSceneId', as: 'sourceScene' });
    
    SceneModel.hasMany(SceneConnectionModel, { foreignKey: 'targetSceneId', as: 'incomingConnections', onDelete: 'CASCADE' });
    SceneConnectionModel.belongsTo(SceneModel, { foreignKey: 'targetSceneId', as: 'targetScene' });

    // Objects & Triggers dentro de Escenas
    SceneModel.hasMany(SceneObjectModel, { foreignKey: 'sceneId', as: 'sceneObjects', onDelete: 'CASCADE' });
    SceneObjectModel.belongsTo(SceneModel, { foreignKey: 'sceneId' });
    
    SceneModel.hasMany(TriggerModel, { foreignKey: 'sceneId', as: 'triggers', onDelete: 'CASCADE' });
    TriggerModel.belongsTo(SceneModel, { foreignKey: 'sceneId' });

    // Assets & Prefabs
    AssetModel.hasMany(SceneObjectModel, { foreignKey: 'assetId' });
    SceneObjectModel.belongsTo(AssetModel, { foreignKey: 'assetId', as: 'asset' });
    AssetModel.hasMany(PrefabModel, { foreignKey: 'assetId' });
    PrefabModel.belongsTo(AssetModel, { foreignKey: 'assetId', as: 'asset' });

    // Narrative & Logic (Pertenece a Escena)
    SceneModel.hasMany(CinematicModel, { foreignKey: 'sceneId', onDelete: 'CASCADE' });
    CinematicModel.belongsTo(SceneModel, { foreignKey: 'sceneId' });

    SceneModel.hasMany(SequenceModel, { foreignKey: 'sceneId', onDelete: 'CASCADE' });
    SequenceModel.belongsTo(SceneModel, { foreignKey: 'sceneId' });

    SequenceModel.hasMany(ActionModel, { foreignKey: 'sequenceId', onDelete: 'CASCADE' });
    ActionModel.belongsTo(SequenceModel, { foreignKey: 'sequenceId' });

    SceneModel.hasMany(DecisionTreeModel, { foreignKey: 'sceneId', onDelete: 'CASCADE' });
    DecisionTreeModel.belongsTo(SceneModel, { foreignKey: 'sceneId' });

    DecisionTreeModel.hasMany(ConsequenceTreeModel, { foreignKey: 'decisionTreeId', onDelete: 'CASCADE' });
    ConsequenceTreeModel.belongsTo(DecisionTreeModel, { foreignKey: 'decisionTreeId' });

    // Motor de Estado (Playthroughs)
    AuthModel.hasMany(PlaythroughModel, { foreignKey: 'userId', as: 'playthroughs', onDelete: 'CASCADE' });
    PlaythroughModel.belongsTo(AuthModel, { foreignKey: 'userId' });

    EpisodeVersionModel.hasMany(PlaythroughModel, { foreignKey: 'episodeVersionId', onDelete: 'CASCADE' });
    PlaythroughModel.belongsTo(EpisodeVersionModel, { foreignKey: 'episodeVersionId' });

    PlaythroughModel.hasMany(PlayerSceneStateModel, { foreignKey: 'playthroughId', onDelete: 'CASCADE' });
    PlayerSceneStateModel.belongsTo(PlaythroughModel, { foreignKey: 'playthroughId' });

    SceneModel.hasMany(PlayerSceneStateModel, { foreignKey: 'sceneId', onDelete: 'CASCADE' });
    PlayerSceneStateModel.belongsTo(SceneModel, { foreignKey: 'sceneId' });

    console.log("[Database] Asociaciones de modelos definidas.");
};

export const syncDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('[Database] ✅ Conexión a la base de datos establecida.');

        if (process.env.NODE_ENV === 'production' && process.env.FORCE_DB_SYNC !== 'true') {
            console.log('[Database] 🛡️ Modo Producción Activo: Saltando sincronización de esquemas.');
            return;
        }

        await sequelize.sync({ alter: true });
        console.log('[Database] ✅ Sincronización de esquemas completada (alter: true). Modelos jerárquicos narrativos montados.');
    } catch (error) {
        console.error('[Database] ❌ Error al inicializar la base de datos:', error);
        throw error;
    }
};