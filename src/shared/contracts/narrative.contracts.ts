
export interface CinematicDto {
    id: string | number;
    uid?: string;
    sceneId?: number;
    name: string;
    durationMs: number;
    tracks: any[];
}

export interface PlaythroughDto {
    id?: number;
    userId: number;
    episodeVersionId: number;
    currentSceneId: number;
    globalFlags: any;
    inventory: any[];
}

export interface ProcessEventDto {
    action: string;
    payload: any;
}

// 🔥 FASE 1: Contrato Actualizado para integrar Modelos 3D mediante Prefabs Reusables
export interface NarrativeRoleDto {
    id?: number;
    episodeId?: number;
    uid: string;
    name: string;
    description: string;
    isEnabled: boolean;
    isPlayable: boolean;
    sortOrder: number;
    characterPrefabId?: number | null; 
    characterPrefab?: any; 
    spawnSceneObjectUid: string | null;
}