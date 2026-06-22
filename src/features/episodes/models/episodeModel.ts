import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../infrastructure/database/config';

export const EpisodeModel = sequelize.define('Episode', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    thumbnailUrl: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    worldSettings: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'Mantiene compatibilidad con Front actual (ej. Visión Blanco/Negro y Color)'
    },
    uiSettings: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'Mantiene compatibilidad con el front actual para Modal de Misión'
    }
}, { 
    tableName: 'episodes', 
    timestamps: true 
});