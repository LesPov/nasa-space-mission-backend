import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../infrastructure/database/config';
import { PlaythroughInterface } from '../interfaces/narrativeInterfaces';

type PlaythroughCreationAttributes = Optional<PlaythroughInterface, 'id' | 'globalFlags' | 'inventory'>;

export const PlaythroughModel = sequelize.define<Model<PlaythroughInterface, PlaythroughCreationAttributes>>('Playthrough', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    episodeVersionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    currentSceneId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'La escena actual en la que se encuentra el jugador'
    },
    globalFlags: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
        comment: 'Variables narrativas globales (ej. { "campesino_trust": 5 })'
    },
    inventory: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
    }
}, { 
    tableName: 'playthroughs', 
    timestamps: true 
});