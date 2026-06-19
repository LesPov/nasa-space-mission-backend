
import { NextFunction, Request, Response } from 'express';
import EpisodeLogicService from '../services/episodeLogicService';

class EpisodeController {
    
    public async getAllEpisodes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const episodes = await EpisodeLogicService.getAllEpisodes();
            res.status(200).json(episodes);
        } catch (error: any) {
            next(error);
        }
    }

    public async createEpisode(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.id) {
                res.status(401).json({ message: "No autorizado" }); return;
            }
            const newEpisode = await EpisodeLogicService.createEpisode(req.body, req.user.id);
            res.status(201).json(newEpisode);
        } catch (error: any) {
            next(error);
        }
    }

    public async getEpisodeFull(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = await EpisodeLogicService.getEpisodeFullData(Number(req.params.id));
            res.status(200).json(data);
        } catch (error: any) {
            next(error);
        }
    }

    public async saveMap(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { sceneObjects, triggers, worldSettings } = req.body;
            const response = await EpisodeLogicService.saveFullMap(Number(req.params.id), sceneObjects, triggers, worldSettings);
            res.status(200).json(response);
        } catch (error: any) {
            next(error);
        }
    }

    public async saveDialogues(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { dialogueGraph } = req.body;
            const response = await EpisodeLogicService.saveDialogueGraph(Number(req.params.id), dialogueGraph);
            res.status(200).json(response);
        } catch (error: any) {
            next(error);
        }
    }
}

export default new EpisodeController();