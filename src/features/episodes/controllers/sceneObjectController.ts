import { Request, Response } from 'express';
import { SceneObjectModel } from '../models/sceneObjectModel';

class SceneObjectController {
    
    // Si en el futuro necesitas cargar un solo objeto específico
    public async getObjectById(req: Request, res: Response): Promise<void> {
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
            res.status(500).json({ message: "Error interno.", error: error.message });
        }
    }

    // Nota: La creación y actualización masiva ahora se maneja desde el 
    // EpisodeController mediante el método saveMap()
}

export default new SceneObjectController();