import { Optional } from 'sequelize';
import { EpisodeVersionStatus, SceneProgressStatus, ActionType } from './enums';

export interface EpisodeVersionInterface {
    id: number;
    episodeId: number;
    versionNumber: number;
    status: EpisodeVersionStatus;
    changelog: string;
}

export interface SceneInterface {
    id: number;
    episodeVersionId: number;
    name: string;
    environmentSettings: any;
    spawnPoint: { x: number; y: number; z: number };
    isInitialScene: boolean;
}

export interface SceneConnectionInterface {
    id: number;
    sourceSceneId: number;
    targetSceneId: number;
    requiredConditionId: string | null; 
    targetSpawnPoint: { x: number; y: number; z: number } | null;
}

export interface PlaythroughInterface {
    id: number;
    userId: number;
    episodeVersionId: number;
    currentSceneId: number;
    globalFlags: any; 
    inventory: any[];
}

export interface PlayerSceneStateInterface {
    id: number;
    playthroughId: number;
    sceneId: number;
    status: SceneProgressStatus;
}

export interface CinematicInterface {
    id: number;
    sceneId: number;
    name: string;
    duration: number;
    timelineData: any;
}

export interface SequenceInterface {
    id: number;
    sceneId: number;
    name: string;
    executionOrder: number;
    isInterruptible: boolean;
}

export interface ActionInterface {
    id: number;
    sequenceId: number;
    actionType: ActionType;
    parameters: any;
}

export interface DecisionTreeInterface {
    id: number;
    sceneId: number;
    name: string;
    rootNodeData: any;
}

export interface ConsequenceTreeInterface {
    id: number;
    decisionTreeId: number;
    consequenceData: any;
}

export interface LoreTreeInterface {
    id: number;
    episodeId: number;
    globalVariablesDefinition: any;
}