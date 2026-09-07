
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../../infrastructure/database/config';

export const NarrativeRoleModel = sequelize.define('NarrativeRole', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    episodeId: { type: DataTypes.INTEGER, allowNull: false },
    uid: { type: DataTypes.STRING, allowNull: false, unique: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    isEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    isPlayable: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    characterPrefabId: { 
        type: DataTypes.INTEGER, 
        allowNull: true,
        comment: 'Referencia al modelo 3D guardado como Prefab'
    },
    spawnSceneObjectUid: { 
        type: DataTypes.STRING, 
        allowNull: true,
        comment: 'Referencia a la ubicación de aparición (Spawn Point)'
    },
}, { 
    tableName: 'narrative_roles', 
    timestamps: true 
});