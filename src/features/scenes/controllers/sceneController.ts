import { NextFunction, Request, Response } from 'express';
import SceneLogicService from '../services/sceneLogicService';

const validateSaveMapDTO = (data: any) => {
    if (!data || typeof data !== 'object') throw new Error("Payload inválido.");
    if (data.sceneObjectsDelta && !Array.isArray(data.sceneObjectsDelta)) throw new Error("sceneObjectsDelta inválido.");
    if (data.triggersDelta && !Array.isArray(data.triggersDelta)) throw new Error("triggersDelta inválido.");
};

class SceneController {
    public async getScenesByEpisode(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const scenes = await SceneLogicService.getScenesByEpisode(Number(req.params.episodeId));
            res.status(200).json(scenes);
        } catch (error: any) { next(error); }
    }

    public async createScene(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const newScene = await SceneLogicService.createScene(Number(req.params.episodeId), req.body.name);
            res.status(201).json(newScene);
        } catch (error: any) { next(error); }
    }

    public async getSceneFull(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = await SceneLogicService.getSceneFullData(Number(req.params.sceneId));
            res.status(200).json(data);
        } catch (error: any) { next(error); }
    }

    public async saveSceneMap(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            validateSaveMapDTO(req.body);
            const response = await SceneLogicService.saveSceneMap(
                Number(req.params.sceneId),
                req.body.sceneObjectsDelta || [],
                req.body.triggersDelta || [],
                req.body.cinematicsDelta || [],
                req.body.deletedObjects || [],
                req.body.deletedTriggers || [],
                req.body.deletedCinematics || [],
                req.body.environmentSettings,
                req.body.spawnPoint
            );
            res.status(200).json(response);
        } catch (error: any) {
            res.status(400).json({ message: 'Error al guardar la plataforma', error: error.message });
        }
    }
}
export default new SceneController();