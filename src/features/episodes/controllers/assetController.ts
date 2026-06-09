import { Request, Response } from 'express';
import AssetLogicService from '../services/assetLogicService';

class AssetController {
    /**
     * Maneja la subida de un nuevo archivo de asset (.glb, .mp4, .png, etc).
     */
    public async uploadAsset(req: Request, res: Response): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({ message: 'No se ha subido ningún archivo o el formato no está permitido.' });
                return;
            }
            const newAsset = await AssetLogicService.createAsset(req.file);
            res.status(201).json(newAsset);
        } catch (error: any) {
            console.error("❌ Error interno en AssetController:", error);
            res.status(500).json({ message: "Error al guardar el asset en la Base de Datos.", error: error.message });
        }
    }
    
    /**
     * Devuelve una lista de todos los assets disponibles.
     */
    public async getAllAssets(req: Request, res: Response): Promise<void> {
        try {
            const assets = await AssetLogicService.getAllAssets();
            res.status(200).json(assets);
        } catch (error: any) {
            res.status(500).json({ message: "Error al obtener los assets.", error: error.message });
        }
    }
}

export default new AssetController();