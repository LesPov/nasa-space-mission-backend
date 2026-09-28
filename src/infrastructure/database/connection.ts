import sequelize from "./config";

import { registerAuthAssociations } from "../../features/auth/auth.associations";
import { registerProfilesAssociations } from "../../features/profiles/profiles.associations";
import { registerEpisodesAssociations } from "../../features/episodes/episodes.associations";
import { registerScenesAssociations } from "../../features/scenes/scenes.associations";
import { registerAssetsAssociations } from "../../features/assets/assets.associations";
import { registerPrefabsAssociations } from "../../features/prefabs/prefabs.associations";
import { registerNarrativeAssociations } from "../../features/narrative/narrative.associations";
import { registerPlayerProgressAssociations } from "../../features/player-progress/player-progress.associations";
import { registerSpaceMissionAssociations } from "../../features/space-mission/space-mission.associations";

// Carga en tiempo de ejecución para registrar el modelo sin exigir declaraciones
// TypeScript del módulo de efectos secundarios.
require('../../features/episodes/models/narrativeRoleModel');
require('../../features/space-mission/models/missionProfileModel');

export const defineDatabaseAssociations = () => {
    console.log("[Database] Registrando asociaciones modulares...");

    registerAuthAssociations();
    registerProfilesAssociations();
    registerEpisodesAssociations();
    registerScenesAssociations();
    registerAssetsAssociations();
    registerPrefabsAssociations();
    registerNarrativeAssociations();
    registerPlayerProgressAssociations();
    registerSpaceMissionAssociations();

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
        console.log('[Database] ✅ Sincronización de esquemas completada (alter: true). Modelos jerárquicos narrativos y aeroespaciales montados.');
    } catch (error) {
        console.error('[Database] ❌ Error al inicializar la base de datos:', error);
        throw error;
    }
};