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

export const defineDatabaseAssociations = () => {
    // Auth -> Perfil, Verificación
    AuthModel.hasOne(userProfileModel, { foreignKey: 'userId', as: 'profile', onDelete: 'CASCADE' });
    userProfileModel.belongsTo(AuthModel, { foreignKey: 'userId' });
    AuthModel.hasOne(VerificationModel, { foreignKey: 'userId', as: 'verification', onDelete: 'CASCADE' });
    VerificationModel.belongsTo(AuthModel, { foreignKey: 'userId' });

    // Auth (Admin) -> Episodios 
    AuthModel.hasMany(EpisodeModel, { foreignKey: 'authorId', as: 'createdEpisodes' });
    EpisodeModel.belongsTo(AuthModel, { as: 'author', foreignKey: 'authorId' });

    // Episodio -> Contenido (El Mapa y los Triggers)
    EpisodeModel.hasMany(SceneObjectModel, { foreignKey: 'episodeId', as: 'sceneObjects', onDelete: 'CASCADE' });
    SceneObjectModel.belongsTo(EpisodeModel, { foreignKey: 'episodeId' });
    
    EpisodeModel.hasMany(TriggerModel, { foreignKey: 'episodeId', as: 'triggers', onDelete: 'CASCADE' });
    TriggerModel.belongsTo(EpisodeModel, { foreignKey: 'episodeId' });

    // SceneObject -> Asset (Modelos 3D y Sonidos)
    AssetModel.hasMany(SceneObjectModel, { foreignKey: 'assetId' });
    SceneObjectModel.belongsTo(AssetModel, { foreignKey: 'assetId', as: 'asset' });

    // Jugador -> Progreso (Partidas Guardadas)
    AuthModel.hasMany(PlayerStateModel, { foreignKey: 'userId', as: 'savedGames', onDelete: 'CASCADE' });
    PlayerStateModel.belongsTo(AuthModel, { foreignKey: 'userId' });
    
    EpisodeModel.hasMany(PlayerStateModel, { foreignKey: 'episodeId', as: 'playerStates', onDelete: 'CASCADE' });
    PlayerStateModel.belongsTo(EpisodeModel, { foreignKey: 'episodeId' });

    console.log("[Database] Asociaciones de modelos definidas para el Game Engine.");
};

export const syncDatabase = async () => {
    try {
        // alter: true sincroniza los cambios nuevos sin borrar la info que ya tienes
        await sequelize.sync({ alter: true });
        console.log('[Database] ✅ Sincronización con la base de datos completada exitosamente.');
    } catch (error) {
        console.error('[Database] ❌ Error al sincronizar la base de datos:', error);
        throw error;
    }
};