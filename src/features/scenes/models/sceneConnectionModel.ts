import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../infrastructure/database/config';
import { SceneConnectionInterface } from '../../narrative/interfaces/narrativeInterfaces';

type SceneConnectionCreationAttributes = Optional<SceneConnectionInterface, 'id' | 'requiredConditionId' | 'targetSpawnPoint'>;

export const SceneConnectionModel = sequelize.define<Model<SceneConnectionInterface, SceneConnectionCreationAttributes>>('SceneConnection', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    sourceSceneId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    targetSceneId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    requiredConditionId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'UID de la condición requerida (Flag, Ítem o Evento) para cruzar'
    },
    targetSpawnPoint: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Si es null, se usa el spawnPoint default de la escena destino'
    }
}, { 
    tableName: 'scene_connections', 
    timestamps: true 
});