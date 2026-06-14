import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../infrastructure/database/config';

export const SceneObjectModel = sequelize.define('SceneObject', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    episodeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    uid: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
        comment: 'ID único del objeto en el Frontend (Babylon.js) para evitar cruces de nombres'
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false, 
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    parentId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Guarda el UID del objeto padre en lugar del nombre'
    },
    position: {
        type: DataTypes.JSON, 
        allowNull: false,
    },
    rotation: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    scale: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    properties: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Colores, intensidad de luz, configuraciones de cámara'
    },
    assetId: {
        type: DataTypes.INTEGER,
        allowNull: true, 
    }
}, {
    tableName: 'scene_objects',
    timestamps: false, 
});