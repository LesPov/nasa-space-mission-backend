import { AssetDto } from "./asset.contracts";

export interface PrefabDto {
    id?: number;
    name: string;
    type: string;
    assetId?: number | null;
    properties: any;
    asset?: AssetDto;
}

export interface PrefabReferenceDto {
    id: number;
}