
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../infrastructure/database/config';
import { PrefabInterface } from '../interfaces/prefabInterface.';
 
export const PrefabModel = sequelize.define<Model<PrefabInterface>>('Prefab', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Nombre del prefab para mostrar en la interfaz'
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'cube, sphere, model, light_spot, etc.'
    },
    assetId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Referencia al archivo GLB o textura si la tiene'
    },
    properties: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'El gran JSON que guarda metadata, secuencias, físicas, luz, etc.'
    }
}, { 
    tableName: 'prefabs', 
    timestamps: true 
});