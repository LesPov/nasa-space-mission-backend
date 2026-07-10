import { PrefabModel } from "./models/prefabModel";
import { AssetModel } from "../assets/models/assetModel";

export const registerPrefabsAssociations = () => {
    // Relación Asset -> Prefab
    AssetModel.hasMany(PrefabModel, { foreignKey: 'assetId' });
    PrefabModel.belongsTo(AssetModel, { foreignKey: 'assetId', as: 'asset' });
};