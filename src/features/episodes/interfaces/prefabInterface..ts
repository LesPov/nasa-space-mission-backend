
import { Optional } from 'sequelize';
import { AssetInterface } from './assetInterface';

export interface PrefabInterface {
    id: number;
    name: string;
    type: string;
    assetId?: number | null;
    properties: any; // JSON con collider, secuencias, colores, configuraciones del jugador, etc.
    asset?: AssetInterface;
    createdAt?: Date;
    updatedAt?: Date;
}

export type PrefabCreationAttributes = Optional<PrefabInterface, 'id' | 'asset'>;