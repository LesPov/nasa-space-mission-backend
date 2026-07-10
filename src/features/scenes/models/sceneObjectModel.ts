import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../infrastructure/database/config';

export const SceneObjectModel = sequelize.define('SceneObject', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    sceneId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Ahora los objetos pertenecen a una Escena (Plataforma), no al Episodio'
    },
    uid: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
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
        comment: 'Solo configuración visual y de físicas base'
    },
    assetId: {
        type: DataTypes.INTEGER,
        allowNull: true, 
    }
}, {
    tableName: 'scene_objects',
    timestamps: false, 
});