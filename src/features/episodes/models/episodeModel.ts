
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
    dialogueGraph: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'JSON exportado desde el Editor de Diálogos de Angular'
    },  
    worldSettings: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'Configuración global del entorno (cielo, gravedad, niebla, luz)'
    },
    uiSettings: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'Configuración visual del Modal de Misión y Objetivos'
    },
}, { tableName: 'episodes', timestamps: true });

// 🔥 FIX CRÍTICO: Sincronizar la tabla automáticamente para evitar ER_BAD_FIELD_ERROR
// Esto añade la columna uiSettings a las bases de datos antiguas sin borrar datos.
EpisodeModel.sync({ alter: true })
    .then(() => console.log('[EpisodeModel] Tabla sincronizada correctamente (alter: true)'))
    .catch(err => console.error('[EpisodeModel] Error en sincronización:', err));