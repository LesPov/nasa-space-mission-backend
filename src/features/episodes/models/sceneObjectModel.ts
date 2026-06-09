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
    type: {
        // 🔥 CAMBIO CRUCIAL: Cambiamos de ENUM a STRING. 
        // Sequelize en MySQL sufre al actualizar ENUMs y rechaza los objetos nuevos.
        type: DataTypes.STRING,
        allowNull: false, 
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
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