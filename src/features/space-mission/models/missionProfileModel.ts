import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../../infrastructure/database/config';
import { MissionProfileDto } from '../../../shared/contracts/space-mission.contracts';

type MissionProfileCreationAttributes = Optional<MissionProfileDto, 'id' | 'remainingBudget' | 'episodeId' | 'telemetry'>;

export const MissionProfileModel = sequelize.define<Model<MissionProfileDto, MissionProfileCreationAttributes>>('MissionProfile', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    episodeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    missionName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    missionCode: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    missionStatus: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'PLANNING'
    },
    currentPhase: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    completionPercentage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    assignedBudget: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    spentBudget: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    remainingBudget: {
        // 🔥 FIX SINTAXIS MYSQL: Cambiado de VIRTUAL a FLOAT real para evitar
        // el crasheo de Sequelize al ejecutar sync({ alter: true }).
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0
    },
    spacecraftName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    spacecraftModel: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    spacecraftMassKg: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    spacecraftPowerWatts: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    spacecraftFuelCapacityKg: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    components: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    },
    telemetry: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    tableName: 'mission_profiles',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['episodeId']
        }
    ],
    hooks: {
        // 🔥 CÁLCULO AUTOMÁTICO ANTES DE GUARDAR EN BASE DE DATOS
        beforeSave: (profile: any) => {
            const assigned = profile.assignedBudget || 0;
            const spent = profile.spentBudget || 0;
            profile.remainingBudget = Math.max(0, assigned - spent);
        }
    }
});