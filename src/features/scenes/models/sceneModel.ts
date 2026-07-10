import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../infrastructure/database/config';
import { SceneInterface } from '../../narrative/interfaces/narrativeInterfaces';

type SceneCreationAttributes = Optional<SceneInterface, 'id'>;

export const SceneModel = sequelize.define<Model<SceneInterface, SceneCreationAttributes>>('Scene', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    episodeVersionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    environmentSettings: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
        comment: 'Skybox, fog, luz ambiental, gravedad, y filtros Blanco/Negro/Color específicos de esta plataforma'
    },
    spawnPoint: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: { x: 0, y: 0, z: 0 },
    },
    isInitialScene: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Define si es la plataforma donde el jugador inicia el episodio'
    }
}, { 
    tableName: 'scenes', 
    timestamps: true 
});