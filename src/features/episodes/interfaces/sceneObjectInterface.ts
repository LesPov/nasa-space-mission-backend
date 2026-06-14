import { Optional } from 'sequelize';
import { AssetInterface } from './assetInterface';

export type SceneObjectType =
    | 'model' | 'cube' | 'sphere' | 'plane' | 'camera' | 'cylinder'
    | 'light_ambient' | 'light_directional' | 'light_point' | 'spawn_point';

export interface SceneObjectInterface {
    id: number;
    episodeId: number;
    uid: string; // 🔥 NUEVO: ID único de BabylonJS para evitar problemas con nombres duplicados
    type: SceneObjectType;
    name: string;
    parentId: string | null; // 🔥 AHORA GUARDARÁ EL 'uid' DEL PADRE, NO EL NOMBRE
    position: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
    properties: { [key: string]: any } | null; 
    assetId?: number | null;
    asset?: AssetInterface;
}

export type SceneObjectCreationAttributes = Optional<
    SceneObjectInterface,
    'id' | 'uid' | 'asset' | 'properties'
>;