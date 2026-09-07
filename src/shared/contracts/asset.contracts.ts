export interface AssetDto {
    id?: number;
    path?: string;
    type?: string;
    name?: string;
    sourceType?: string;
}

export interface AssetResponseDto extends AssetDto {}

export interface AssetUploadDto {
    file: any; // Mapeo temporal para archivos binarios multipart/form-data
}