import { AssetModel } from "./models/assetModel";
import { SceneObjectModel } from "../scenes/models/sceneObjectModel";

export const registerAssetsAssociations = () => {
    // Relación Asset -> SceneObject
    AssetModel.hasMany(SceneObjectModel, { foreignKey: 'assetId' });
    SceneObjectModel.belongsTo(AssetModel, { foreignKey: 'assetId', as: 'asset' });
};