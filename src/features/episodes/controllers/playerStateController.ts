import { Request, Response } from 'express';
import { PlayerStateModel } from '../models/playerStateModel';

class PlayerStateController {
    
    // Cargar partida del jugador
    public async loadGame(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const { episodeId, slot } = req.params;

            // Busca si ya hay una partida guardada
            let state = await PlayerStateModel.findOne({
                where: { userId, episodeId: Number(episodeId), slot: Number(slot) }
            });

            if (!state) {
                // Si no existe, crea una partida nueva (Reset)
                state = await PlayerStateModel.create({
                    userId,
                    episodeId: Number(episodeId),
                    slot: Number(slot),
                    lastPosition: { x: 0, y: 0, z: 0 },
                    worldState: {}, // Aquí irán variables como: {"tiene_llave": false, "salvo_carly": true}
                    inventory: []
                });
            }

            res.status(200).json(state);
        } catch (error: any) {
            res.status(500).json({ message: "Error cargando la partida", error: error.message });
        }
    }

    // Guardar partida del jugador (Se llama automáticamente desde Angular)
    public async saveGame(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.user!.id;
            const { episodeId, slot } = req.params;
            const { lastPosition, worldState, inventory } = req.body;

            // Upsert: Si existe la partida la actualiza, si no, la crea.
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
            res.status(500).json({ message: "Error guardando la partida", error: error.message });
        }
    }
}

export default new PlayerStateController();