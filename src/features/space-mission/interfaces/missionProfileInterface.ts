import { Model, Optional } from 'sequelize';
import { 
    MissionStatus, 
    SpacecraftComponentDto, 
    TelemetryDataDto 
} from '../../../shared/contracts/space-mission.contracts';

export interface MissionProfileAttributes {
    id: number;
    episodeId: number;
    missionName: string;
    missionCode: string;
    description: string;
    missionStatus: MissionStatus;
    currentPhase: string;
    completionPercentage: number;
    assignedBudget: number;
    spentBudget: number;
    remainingBudget: number;
    spacecraftName: string;
    spacecraftModel: string;
    spacecraftMassKg: number;
    spacecraftPowerWatts: number;
    spacecraftFuelCapacityKg: number;
    components: SpacecraftComponentDto[];
    telemetryData: TelemetryDataDto;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface MissionProfileCreationAttributes extends Optional<
    MissionProfileAttributes, 
    'id' | 'missionStatus' | 'currentPhase' | 'completionPercentage' | 'spentBudget' | 'remainingBudget' | 'components' | 'telemetryData' | 'createdAt' | 'updatedAt'
> {}

export interface MissionProfileInstance extends Model<MissionProfileAttributes, MissionProfileCreationAttributes>, MissionProfileAttributes {}