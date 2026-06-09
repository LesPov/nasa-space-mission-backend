import { Optional } from 'sequelize';
import { AssetInterface } from './assetInterface';

export type SceneObjectType =
    | 'model' | 'cube' | 'sphere' | 'plane' | 'camera' | 'cylinder'
    | 'light_ambient' | 'light_directional' | 'light_point' | 'spawn_point';

export interface SceneObjectInterface {
    id: number;
    episodeId: number;
    type: SceneObjectType;
    name: string;

    // --- TRANSFORMACIONES ---
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };

    // --- PROPIEDADES EXTRA (Luces, físicas, etc) ---
    properties: { [key: string]: any } | null; 
    
    // --- RELACIÓN CON ARCHIVOS (.GLB, .MP4, etc) ---
    assetId?: number | null;
    asset?: AssetInterface;
}

export type SceneObjectCreationAttributes = Optional<
    SceneObjectInterface,
    'id' | 'asset' | 'properties'
>;