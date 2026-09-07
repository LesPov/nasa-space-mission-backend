import { Vector3Dto } from "./scene.contracts";

export interface PlayerStateDto {
    id?: number;
    userId?: number;
    episodeId: number;
    slot: number;
    lastPosition: Vector3Dto;
    worldState: Record<string, any>;
    inventory: any[];
}

export interface SaveProgressDto extends PlayerStateDto {}