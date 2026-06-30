import { NextFunction, Request, Response } from 'express';
import EpisodeLogicService from '../services/episodeLogicService';

const validateSaveMapDTO = (data: any) => {
    if (!data || typeof data !== 'object') throw new Error("Payload inválido.");
    if (data.sceneObjectsDelta && !Array.isArray(data.sceneObjectsDelta)) throw new Error("sceneObjectsDelta inválido.");
    if (data.triggersDelta && !Array.isArray(data.triggersDelta)) throw new Error("triggersDelta inválido.");
};

class EpisodeController {
    public async getAllEpisodes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const episodes = await EpisodeLogicService.getAllEpisodes();
            res.status(200).json(episodes);
        } catch (error: any) { next(error); }
    }

    public async createEpisode(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.id) {
                res.status(401).json({ message: "No autorizado" }); return;
            }
            const newEpisode = await EpisodeLogicService.createEpisode(req.body, req.user.id);
            res.status(201).json(newEpisode);
        } catch (error: any) { next(error); }
    }

    public async getScenesByEpisode(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const scenes = await EpisodeLogicService.getScenesByEpisode(Number(req.params.episodeId));
            res.status(200).json(scenes);
        } catch (error: any) { next(error); }
    }

    public async createScene(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const newScene = await EpisodeLogicService.createScene(Number(req.params.episodeId), req.body.name);
            res.status(201).json(newScene);
        } catch (error: any) { next(error); }
    }

    public async getSceneFull(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = await EpisodeLogicService.getSceneFullData(Number(req.params.sceneId));
            res.status(200).json(data);
        } catch (error: any) { next(error); }
    }

    public async saveSceneMap(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            validateSaveMapDTO(req.body);
            const { 
                sceneObjectsDelta, triggersDelta, cinematicsDelta, 
                deletedObjects, deletedTriggers, deletedCinematics, 
                environmentSettings, spawnPoint 
            } = req.body;
            
            const response = await EpisodeLogicService.saveSceneMap(
                Number(req.params.sceneId),
                sceneObjectsDelta || [],
                triggersDelta || [],
                cinematicsDelta || [],
                deletedObjects || [],
                deletedTriggers || [],
                deletedCinematics || [],
                environmentSettings,
                spawnPoint
            );
            
            res.status(200).json(response);
        } catch (error: any) {
            res.status(400).json({ message: 'Error al guardar la plataforma', error: error.message });
        }
    }
}

export default new EpisodeController();