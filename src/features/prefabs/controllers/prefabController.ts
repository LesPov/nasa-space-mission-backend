
import { NextFunction, Request, Response } from 'express';
import { PrefabModel } from '../models/prefabModel';
import { AssetModel } from 'features/assets/models/assetModel';
 
class PrefabController {
    
    public async getAllPrefabs(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const prefabs = await PrefabModel.findAll({
                include: [{ model: AssetModel, as: 'asset' }],
                order: [['createdAt', 'DESC']]
            });
            res.status(200).json(prefabs);
        } catch (error: any) {
            next(error);
        }
    }

    public async createPrefab(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { name, type, assetId, properties } = req.body;

            if (!name || !type || !properties) {
                res.status(400).json({ message: "Faltan datos obligatorios (name, type, properties)." });
                return;
            }

            const newPrefab = await PrefabModel.create({ name, type, assetId: assetId || null, properties, id: 0 });

            const prefabCompleto = await PrefabModel.findByPk(newPrefab.getDataValue('id'), {
                include: [{ model: AssetModel, as: 'asset' }]
            });

            res.status(201).json(prefabCompleto);
        } catch (error: any) {
            next(error);
        }
    }

    public async deletePrefab(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            const deleted = await PrefabModel.destroy({ where: { id } });
            
            if (deleted) {
                res.status(200).json({ message: "Prefab eliminado exitosamente." });
            } else {
                res.status(404).json({ message: "Prefab no encontrado." });
            }
        } catch (error: any) {
            next(error);
        }
    }
}

export default new PrefabController();