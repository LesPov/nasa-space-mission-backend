import sequelize from "./config";

// 1. IMPORTAMOS ÚNICAMENTE LOS REGISTRADORES DE ASOCIACIONES (Arquitectura Modular)
import { registerAuthAssociations } from "../../features/auth/auth.associations";
import { registerProfilesAssociations } from "../../features/profiles/profiles.associations";
import { registerEpisodesAssociations } from "../../features/episodes/episodes.associations";
import { registerScenesAssociations } from "../../features/scenes/scenes.associations";
import { registerAssetsAssociations } from "../../features/assets/assets.associations";
import { registerPrefabsAssociations } from "../../features/prefabs/prefabs.associations";
import { registerNarrativeAssociations } from "../../features/narrative/narrative.associations";
import { registerPlayerProgressAssociations } from "../../features/player-progress/player-progress.associations";

export const defineDatabaseAssociations = () => {
    console.log("[Database] Registrando asociaciones modulares...");

    // 2. EJECUTAMOS LAS ASOCIACIONES EN ORDEN ESTRICTO DE JERARQUÍA DOMINIO
    registerAuthAssociations();
    registerProfilesAssociations();
    registerEpisodesAssociations();
    registerScenesAssociations();
    registerAssetsAssociations();
    registerPrefabsAssociations();
    registerNarrativeAssociations();
    registerPlayerProgressAssociations();

    console.log("[Database] Asociaciones de modelos modulares definidas con éxito.");
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