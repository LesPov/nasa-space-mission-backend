import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../infrastructure/database/config';
import { PlayerSceneStateInterface } from '../interfaces/narrativeInterfaces';
// IMPORT CORREGIDO
import { SceneProgressStatus } from '../interfaces/enums';

type PlayerSceneStateCreationAttributes = Optional<PlayerSceneStateInterface, 'id'>;

export const PlayerSceneStateModel = sequelize.define<Model<PlayerSceneStateInterface, PlayerSceneStateCreationAttributes>>('PlayerSceneState', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    playthroughId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    sceneId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM(...Object.values(SceneProgressStatus)),
        allowNull: false,
        defaultValue: SceneProgressStatus.LOCKED,
    }
}, { 
    tableName: 'player_scene_states', 
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['playthroughId', 'sceneId']
        }
    ]
});