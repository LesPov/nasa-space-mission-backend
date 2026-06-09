export interface AssetInterface {
    id?: number;
    name: string;
    type: 'model_glb' | 'video_mp4' | 'texture_png' | 'texture_jpg' | 'sound_mp3';
    path: string;
    sourceType: 'LOCAL';
}