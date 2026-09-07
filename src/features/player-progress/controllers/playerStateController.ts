import { NextFunction, Request, Response } from 'express';
import { PlayerStateModel } from '../models/playerStateModel';
// 🔥 NUEVO: Importación del contrato DTO
import { SaveProgressDto } from '../../../shared/contracts';

class PlayerStateController {
    public async loadGame(req: Request<{ episodeId: string, slot: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const { episodeId, slot } = req.params;

            let state = await PlayerStateModel.findOne({
                where: { userId, episodeId: Number(episodeId), slot: Number(slot) }
            });

            if (!state) {
                state = await PlayerStateModel.create({
                    userId,
                    episodeId: Number(episodeId),
                    slot: Number(slot),
                    lastPosition: { x: 0, y: 0, z: 0 },
                    worldState: {},
                    inventory: []
                });
            }

            res.status(200).json(state);
        } catch (error: any) {
            next(error);
        }
    }

    public async saveGame(req: Request<{ episodeId: string, slot: string }, any, SaveProgressDto>, res: Response, next: NextFunction): Promise<void> {
        try {
            const userId = req.user!.id;
            const { episodeId, slot } = req.params;
            const { lastPosition, worldState, inventory } = req.body;

            const [state] = await PlayerStateModel.upsert({
                userId,
                episodeId: Number(episodeId),
                slot: Number(slot),
                lastPosition,
                worldState,
                inventory
            });

            res.status(200).json({ message: "Partida guardada exitosamente", state });
        } catch (error: any) {
            next(error);
        }
    }
}

export default new PlayerStateController();