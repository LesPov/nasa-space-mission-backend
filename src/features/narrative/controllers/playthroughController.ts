import { NextFunction, Request, Response } from 'express';
import PlaythroughLogicService from '../services/playthroughLogicService';
// 🔥 NUEVO: Importación de los contratos de narrativa
import { ProcessEventDto } from '../../../shared/contracts';

class PlaythroughController {
    public async startPlaythrough(req: Request<any, any, { episodeVersionId: number }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const { episodeVersionId } = req.body;
            
            if (!episodeVersionId) {
                res.status(400).json({ message: "Se requiere episodeVersionId" }); return;
            }

            const playthrough = await PlaythroughLogicService.startPlaythrough(userId, Number(episodeVersionId));
            res.status(201).json(playthrough);
        } catch (error: any) {
            next(error);
        }
    }

    public async processEvent(req: Request<{ playthroughId: string }, any, ProcessEventDto>, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const playthroughId = Number(req.params.playthroughId);
            const event = req.body; // { action: "REQUEST_SCENE_TRANSITION", payload: { connectionId: 123 } }

            if (!event || !event.action) {
                res.status(400).json({ message: "Formato de evento inválido" }); return;
            }

            const result = await PlaythroughLogicService.processEvent(userId, playthroughId, event);
            res.status(200).json(result);
        } catch (error: any) {
            next(error);
        }
    }

    public async getState(req: Request<{ playthroughId: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const playthroughId = Number(req.params.playthroughId);

            const state = await PlaythroughLogicService.getPlaythroughState(userId, playthroughId);
            res.status(200).json(state);
        } catch (error: any) {
            next(error);
        }
    }
}

export default new PlaythroughController();