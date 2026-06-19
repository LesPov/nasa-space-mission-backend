
import sequelize from "./config";

// --- Importaciones de Modelos ---
import { AuthModel } from "../../features/auth/models/authModel";
import { VerificationModel } from "../../features/auth/models/verificationModel";
import { AssetModel } from "../../features/episodes/models/assetModel";
import { EpisodeModel } from "../../features/episodes/models/episodeModel";
import { SceneObjectModel } from "../../features/episodes/models/sceneObjectModel";
import { TriggerModel } from "../../features/episodes/models/triggerModel";
import { PlayerStateModel } from "../../features/episodes/models/playerStateModel";
import { userProfileModel } from "../../features/profiles/models/userProfileModel";
import { PrefabModel } from "../../features/episodes/models/prefabModel"; 

export const defineDatabaseAssociations = () => {
    AuthModel.hasOne(userProfileModel, { foreignKey: 'userId', as: 'profile', onDelete: 'CASCADE' });
    userProfileModel.belongsTo(AuthModel, { foreignKey: 'userId' });
    AuthModel.hasOne(VerificationModel, { foreignKey: 'userId', as: 'verification', onDelete: 'CASCADE' });
    VerificationModel.belongsTo(AuthModel, { foreignKey: 'userId' });

    AuthModel.hasMany(EpisodeModel, { foreignKey: 'authorId', as: 'createdEpisodes' });
    EpisodeModel.belongsTo(AuthModel, { as: 'author', foreignKey: 'authorId' });

    EpisodeModel.hasMany(SceneObjectModel, { foreignKey: 'episodeId', as: 'sceneObjects', onDelete: 'CASCADE' });
    SceneObjectModel.belongsTo(EpisodeModel, { foreignKey: 'episodeId' });
    
    EpisodeModel.hasMany(TriggerModel, { foreignKey: 'episodeId', as: 'triggers', onDelete: 'CASCADE' });
    TriggerModel.belongsTo(EpisodeModel, { foreignKey: 'episodeId' });

    AssetModel.hasMany(SceneObjectModel, { foreignKey: 'assetId' });
    SceneObjectModel.belongsTo(AssetModel, { foreignKey: 'assetId', as: 'asset' });

    AssetModel.hasMany(PrefabModel, { foreignKey: 'assetId' });
    PrefabModel.belongsTo(AssetModel, { foreignKey: 'assetId', as: 'asset' });

    AuthModel.hasMany(PlayerStateModel, { foreignKey: 'userId', as: 'savedGames', onDelete: 'CASCADE' });
    PlayerStateModel.belongsTo(AuthModel, { foreignKey: 'userId' });
    
    EpisodeModel.hasMany(PlayerStateModel, { foreignKey: 'episodeId', as: 'playerStates', onDelete: 'CASCADE' });
    PlayerStateModel.belongsTo(EpisodeModel, { foreignKey: 'episodeId' });

    console.log("[Database] Asociaciones de modelos definidas.");
};

export const syncDatabase = async () => {
    try {
        // 🔥 VALIDACIÓN ULTRA RÁPIDA: Solo conectamos y verificamos credenciales.
        await sequelize.authenticate();
        console.log('[Database] ✅ Conexión a la base de datos establecida.');

        // 🔥 AISLAMIENTO PRODUCCIÓN: Salto de sincronización para evitar queries pesadas y bloqueos
        if (process.env.NODE_ENV === 'production' && process.env.FORCE_DB_SYNC !== 'true') {
            console.log('[Database] 🛡️ Modo Producción Activo: Saltando sincronización de esquemas (Arranque Veloz).');
            return;
        }

        // Modo Desarrollo: Sincronización normal
        await sequelize.sync({ alter: false });
        console.log('[Database] ✅ Sincronización de esquemas de desarrollo completada (alter: false).');
    } catch (error) {
        console.error('[Database] ❌ Error al inicializar la base de datos:', error);
        throw error;
    }
};