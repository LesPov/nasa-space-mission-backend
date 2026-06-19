
import { NextFunction, Request, Response } from 'express';
import { SceneObjectModel } from '../models/sceneObjectModel';

class SceneObjectController {
    public async getObjectById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { episodeId, objectId } = req.params;
            const sceneObject = await SceneObjectModel.findOne({
                where: { id: objectId, episodeId }
            });

            if (!sceneObject) {
                res.status(404).json({ message: "Objeto no encontrado." });
                return;
            }

            res.status(200).json(sceneObject);
        } catch (error: any) {
            next(error);
        }
    }
}

export default new SceneObjectController();