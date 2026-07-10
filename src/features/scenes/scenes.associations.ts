import { SceneModel } from "./models/sceneModel";
import { SceneObjectModel } from "./models/sceneObjectModel";
import { SceneConnectionModel } from "./models/sceneConnectionModel";
import { TriggerModel } from "./models/triggerModel";
import { EpisodeVersionModel } from "../episodes/models/episodeVersionModel";

export const registerScenesAssociations = () => {
    // Relación EpisodeVersion -> Scene
    EpisodeVersionModel.hasMany(SceneModel, { foreignKey: 'episodeVersionId', onDelete: 'CASCADE' });
    SceneModel.belongsTo(EpisodeVersionModel, { foreignKey: 'episodeVersionId' });

    // Relaciones de Conexiones entre Escenas (Transiciones)
    SceneModel.hasMany(SceneConnectionModel, { foreignKey: 'sourceSceneId', as: 'outgoingConnections', onDelete: 'CASCADE' });
    SceneConnectionModel.belongsTo(SceneModel, { foreignKey: 'sourceSceneId', as: 'sourceScene' });
    
    SceneModel.hasMany(SceneConnectionModel, { foreignKey: 'targetSceneId', as: 'incomingConnections', onDelete: 'CASCADE' });
    SceneConnectionModel.belongsTo(SceneModel, { foreignKey: 'targetSceneId', as: 'targetScene' });

    // Relaciones de Escena con Objetos y Triggers
    SceneModel.hasMany(SceneObjectModel, { foreignKey: 'sceneId', as: 'sceneObjects', onDelete: 'CASCADE' });
    SceneObjectModel.belongsTo(SceneModel, { foreignKey: 'sceneId' });
    
    SceneModel.hasMany(TriggerModel, { foreignKey: 'sceneId', as: 'triggers', onDelete: 'CASCADE' });
    TriggerModel.belongsTo(SceneModel, { foreignKey: 'sceneId' });
};