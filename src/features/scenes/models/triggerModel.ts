import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../infrastructure/database/config';
import { TriggerAction, TriggerCondition, TriggerInterface } from '../interfaces/triggerInterface';

interface TriggerCreationAttributes extends Optional<TriggerInterface, 'id' | 'uid'> {
    sceneId?: number;
}

export const TriggerModel = sequelize.define<Model<TriggerInterface & { sceneId: number }, TriggerCreationAttributes>>('Trigger', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    episodeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Deprecado. Se mantiene null por retrocompatibilidad temporal.'
    },
    sceneId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Ahora los triggers pertenecen a una Escena (Plataforma)'
    },
    uid: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
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
    size: {
        type: DataTypes.JSON,
        allowNull: false,
    },   rotation: {
        type: DataTypes.JSON,
        allowNull: false,
    },
    condition: {
        type: DataTypes.ENUM(...Object.values(TriggerCondition)),
        allowNull: false,
    },
    actionType: {
        type: DataTypes.ENUM(...Object.values(TriggerAction)),
        allowNull: false,
    },
    targetObjectName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    actionProperties: {
        type: DataTypes.JSON,
        allowNull: true,
    },
    isRepeatable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    isEnabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
    },
}, { 
    tableName: 'triggers', 
    timestamps: true 
});