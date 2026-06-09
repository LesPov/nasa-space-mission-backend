import { Request, Response } from 'express';
import EpisodeLogicService from '../services/episodeLogicService';

class EpisodeController {
    
    // 👇 METODO QUE FALTABA
    public async getAllEpisodes(req: Request, res: Response): Promise<void> {
        try {
            const episodes = await EpisodeLogicService.getAllEpisodes();
            res.status(200).json(episodes);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    public async createEpisode(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user || !req.user.id) {
                res.status(401).json({ message: "No autorizado" }); return;
            }
            const newEpisode = await EpisodeLogicService.createEpisode(req.body, req.user.id);
            res.status(201).json(newEpisode);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    public async getEpisodeFull(req: Request, res: Response): Promise<void> {
        try {
            const data = await EpisodeLogicService.getEpisodeFullData(Number(req.params.id));
            res.status(200).json(data);
        } catch (error: any) {
            res.status(404).json({ message: error.message });
        }
    }

    public async saveMap(req: Request, res: Response): Promise<void> {
        try {
            const { sceneObjects } = req.body;
            const response = await EpisodeLogicService.saveFullMap(Number(req.params.id), sceneObjects);
            res.status(200).json(response);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }

    public async saveDialogues(req: Request, res: Response): Promise<void> {
        try {
            const { dialogueGraph } = req.body;
            const response = await EpisodeLogicService.saveDialogueGraph(Number(req.params.id), dialogueGraph);
            res.status(200).json(response);
        } catch (error: any) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new EpisodeController();