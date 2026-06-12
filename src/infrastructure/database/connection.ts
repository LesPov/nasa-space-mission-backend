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

/**
 * 🔥 FUNCION DE LIMPIEZA AUTOMÁTICA 🔥
 * Esta función detecta y elimina los índices basura que Sequelize multiplicó por error.
 * No afecta los datos de los usuarios, solo elimina configuraciones redundantes en MySQL.
 */
const cleanGarbageIndexes = async () => {
    try {
        console.log("[Database] Limpiando índices basura de la tabla 'auth'...");
        
        // Obtenemos todos los índices actuales de la tabla auth
        const [results]: any = await sequelize.query("SHOW INDEX FROM auth");
        
        // Filtramos para obtener solo los nombres únicos
        const indexNames = [...new Set(results.map((i: any) => i.Key_name))];
        
        for (const indexName of indexNames) {
            // Jamás borramos la PRIMARY KEY, solo los índices secundarios
            if (indexName !== 'PRIMARY') {
                try {
                    // Borramos el índice. Al usar alter:true después, Sequelize creará los correctos.
                    await sequelize.query(`ALTER TABLE auth DROP INDEX \`${indexName}\``);
                    console.log(`[Database] Índice eliminado: ${indexName}`);
                } catch (err) {
                    // Si falla uno no pasa nada, continuamos con el siguiente
                }
            }
        }
        console.log("[Database] Limpieza de índices completada con éxito.");
    } catch (error) {
        console.log("[Database] No se pudo limpiar índices (probablemente la tabla aún no existe).");
    }
};

export const syncDatabase = async () => {
    try {
        // 1. Ejecutamos el limpiador de basura ANTES de sincronizar
        await cleanGarbageIndexes();

        // 2. alter: true sincronizará la nueva estructura sin los bugs de los índices
        await sequelize.sync({ alter: true });
        console.log('[Database] ✅ Sincronización con la base de datos completada exitosamente.');
    } catch (error) {
        console.error('[Database] ❌ Error al sincronizar la base de datos:', error);
        throw error;
    }
};