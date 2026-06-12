import { DataTypes, Model, Optional } from 'sequelize';
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
    isPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    // El JSON donde guardarás el árbol de diálogos y eventos de la historia
    dialogueGraph: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'JSON exportado desde el Editor de Diálogos de Angular'
    },
    // 🔥 AÑADIDO: Guardar configuraciones del entorno (Babylon.js)
    worldSettings: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'Configuración global del entorno (cielo, gravedad, niebla, luz)'
    }
}, { tableName: 'episodes', timestamps: true });