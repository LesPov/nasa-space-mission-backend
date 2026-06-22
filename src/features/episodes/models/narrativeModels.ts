import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../infrastructure/database/config';
// IMPORT CORREGIDO
import { ActionType } from '../interfaces/enums';

export const CinematicModel = sequelize.define('Cinematic', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sceneId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    duration: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    timelineData: { type: DataTypes.JSON, allowNull: false, defaultValue: {} }
}, { tableName: 'cinematics', timestamps: true });

export const SequenceModel = sequelize.define('Sequence', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sceneId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    executionOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    isInterruptible: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, { tableName: 'sequences', timestamps: true });

export const ActionModel = sequelize.define('Action', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sequenceId: { type: DataTypes.INTEGER, allowNull: false },
    actionType: { type: DataTypes.ENUM(...Object.values(ActionType)), allowNull: false },
    parameters: { type: DataTypes.JSON, allowNull: false, defaultValue: {} }
}, { tableName: 'actions', timestamps: true });

export const DecisionTreeModel = sequelize.define('DecisionTree', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sceneId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    rootNodeData: { type: DataTypes.JSON, allowNull: false, defaultValue: {} }
}, { tableName: 'decision_trees', timestamps: true });

export const ConsequenceTreeModel = sequelize.define('ConsequenceTree', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    decisionTreeId: { type: DataTypes.INTEGER, allowNull: false },
    consequenceData: { type: DataTypes.JSON, allowNull: false, defaultValue: {} }
}, { tableName: 'consequence_trees', timestamps: true });

export const LoreTreeModel = sequelize.define('LoreTree', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    episodeId: { type: DataTypes.INTEGER, allowNull: false },
    globalVariablesDefinition: { type: DataTypes.JSON, allowNull: false, defaultValue: {} }
}, { tableName: 'lore_trees', timestamps: true }); 