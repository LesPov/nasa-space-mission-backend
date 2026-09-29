
import { NextFunction, Request, Response } from 'express';
import SceneLogicService from '../services/sceneLogicService';
import { SceneSavePayload } from '../../../shared/contracts';

const validateSaveMapDTO = (data: SceneSavePayload) => {
    if (!data || typeof data !== 'object') throw new Error("Payload inválido.");
    if (data.sceneObjectsDelta && !Array.isArray(data.sceneObjectsDelta)) throw new Error("sceneObjectsDelta inválido.");
    if (data.triggersDelta && !Array.isArray(data.triggersDelta)) throw new Error("triggersDelta inválido.");
};

class SceneController {
    public async getScenesByEpisode(req: Request<{ episodeId: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const scenes = await SceneLogicService.getScenesByEpisode(Number(req.params.episodeId));
            res.status(200).json(scenes);
        } catch (error: any) { next(error); }
    }

    public async createScene(req: Request<{ episodeId: string }, any, { name: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const newScene = await SceneLogicService.createScene(Number(req.params.episodeId), req.body.name);
            res.status(201).json(newScene);
        } catch (error: any) { next(error); }
    }

    // 🔥 NUEVO CONTROLADOR: Actualiza una escena individual (ej: su nombre)
    public async updateScene(req: Request<{ sceneId: string }, any, { name?: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const sceneId = Number(req.params.sceneId);
            const scene = await SceneLogicService.updateScene(sceneId, req.body);
            res.status(200).json({ message: 'Plataforma actualizada correctamente', scene });
        } catch (error: any) {
            next(error);
        }
    }

    public async getSceneFull(req: Request<{ sceneId: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = await SceneLogicService.getSceneFullData(Number(req.params.sceneId));
            res.status(200).json(data);
        } catch (error: any) { next(error); }
    }

    public async saveSceneMap(req: Request<{ sceneId: string }, any, SceneSavePayload>, res: Response, next: NextFunction): Promise<void> {
        try {
            const bodyData: SceneSavePayload = req.body;
            validateSaveMapDTO(bodyData);
            
            const response = await SceneLogicService.saveSceneMap(
                Number(req.params.sceneId),
                bodyData.sceneObjectsDelta || [],
                bodyData.triggersDelta || [],
                bodyData.cinematicsDelta || [],
                bodyData.deletedObjects || [],
                bodyData.deletedTriggers || [],
                bodyData.deletedCinematics || [],
                bodyData.environmentSettings,
                bodyData.uiSettings, // 🔥 Pasamos uiSettings
                bodyData.spawnPoint
            );
            res.status(200).json(response);
        } catch (error: any) {
            res.status(400).json({ message: 'Error al guardar la plataforma', error: error.message });
        }
    }
}
export default new SceneController();