
import { NextFunction, Request, Response } from 'express';
import AssetLogicService from '../services/assetLogicService';

class AssetController {
    public async uploadAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.file) {
                res.status(400).json({ message: 'No se ha subido ningún archivo o el formato no está permitido.' });
                return;
            }
            const newAsset = await AssetLogicService.createAsset(req.file);
            res.status(201).json(newAsset);
        } catch (error: any) {
            next(error);
        }
    }
    
    public async getAllAssets(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const assets = await AssetLogicService.getAllAssets();
            res.status(200).json(assets);
        } catch (error: any) {
            next(error);
        }
    }
}

export default new AssetController();