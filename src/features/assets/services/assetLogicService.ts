import { AssetModel } from '../models/assetModel';
import { AssetInterface } from '../interfaces/assetInterface';
import path from 'path';

class AssetLogicService {
    constructor() {
        console.log("[AssetLogicService] Servicio de lógica de assets locales inicializado.");
    }

    /**
     * Maneja la creación de un asset a partir de un archivo subido (.glb, .mp4, etc)
     */
    public async createAsset(file: Express.Multer.File): Promise<AssetInterface> {
        if (!file) {
            throw new Error("No se proporcionó ningún archivo.");
        }
 
        const ext = path.extname(file.originalname).toLowerCase();
        let typeToSave: string;

        if (ext === '.glb' || ext === '.obj') {
            typeToSave = 'model_glb';
        } else if (ext === '.mp4') {
            typeToSave = 'video_mp4';
        } else if (ext === '.png') {
            typeToSave = 'texture_png';
        } else if (ext === '.jpg' || ext === '.jpeg') {
            typeToSave = 'texture_jpg';
        } else if (ext === '.mp3') {
            typeToSave = 'sound_mp3';
        } else {
            throw new Error(`Tipo de archivo no soportado en la Base de Datos: ${ext}`);
        }

        try {
            const newAsset = await AssetModel.create({
                name: file.originalname,
                type: typeToSave as any, // Casteamos a 'any' para evitar conflictos de TypeScript
                path: `/uploads/assets/${file.filename}`,
                sourceType: 'LOCAL'
            });

            return newAsset.toJSON() as AssetInterface;
        } catch (dbError: any) {
            console.error("[AssetLogicService] Error insertando en MySQL:", dbError);
            throw new Error("No se pudo guardar el registro en MySQL. " + dbError.message);
        }
    }

    /**
     * Obtiene todos los assets disponibles en el servidor
     */
    public async getAllAssets(): Promise<AssetInterface[]> {
        try {
            const assets = await AssetModel.findAll({ order: [['createdAt', 'DESC']] });
            return assets.map(asset => asset.toJSON() as AssetInterface);
        } catch (error: any) {
            console.error("[AssetLogicService] Error al obtener los assets:", error);
            throw new Error("No se pudieron obtener los assets.");
        }
    }
}

export default new AssetLogicService();