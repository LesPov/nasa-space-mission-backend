import { NextFunction, Request, Response } from 'express';
import EpisodeLogicService from '../services/episodeLogicService';

// No requiere un DTO complejo al ser solo título y descripción
interface CreateEpisodeDto {
    title: string;
    description?: string;
}

class EpisodeController {
    public async getAllEpisodes(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const episodes = await EpisodeLogicService.getAllEpisodes();
            res.status(200).json(episodes);
        } catch (error: any) { next(error); }
    }

    public async createEpisode(req: Request<any, any, CreateEpisodeDto>, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user || !req.user.id) {
                res.status(401).json({ message: "No autorizado" }); return;
            }
            const newEpisode = await EpisodeLogicService.createEpisode(req.body, req.user.id);
            res.status(201).json(newEpisode);
        } catch (error: any) { next(error); }
    }
}
export default new EpisodeController();