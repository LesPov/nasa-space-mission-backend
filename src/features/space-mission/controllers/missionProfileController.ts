import { Request, Response, NextFunction } from 'express';
import MissionProfileLogicService from '../services/missionProfileLogicService';
import { CreateMissionProfileDto, MissionProfileDto } from '../../../shared/contracts/space-mission.contracts';

class MissionProfileController {
    public async getProfile(req: Request<{ episodeId: string }>, res: Response, next: NextFunction): Promise<void> {
        try {
            const episodeId = Number(req.params.episodeId);
            const profile = await MissionProfileLogicService.getProfileByEpisode(episodeId);
            
            // 🔥 SOLUCIÓN DEL ERROR 404 DE ANGULAR
            // Devolvemos status 200 con `null` en lugar de un error 404 para evitar
            // excepciones en el Frontend cuando la misión apenas fue creada y no tiene perfil.
            if (!profile) {
                res.status(200).json(null);
                return;
            }
            
            res.status(200).json(profile);
        } catch (error) {
            next(error);
        }
    }

    public async createProfile(req: Request<{ episodeId: string }, any, CreateMissionProfileDto>, res: Response, next: NextFunction): Promise<void> {
        try {
            const episodeId = Number(req.params.episodeId);
            
            if (!req.body.missionName || !req.body.missionCode || !req.body.spacecraftName) {
                res.status(400).json({ message: "Payload inválido: Faltan datos obligatorios." });
                return;
            }

            const profile = await MissionProfileLogicService.createProfile(episodeId, req.body);
            res.status(201).json(profile);
        } catch (error) {
            next(error);
        }
    }

    public async updateProfile(req: Request<{ episodeId: string }, any, Partial<MissionProfileDto>>, res: Response, next: NextFunction): Promise<void> {
        try {
            const episodeId = Number(req.params.episodeId);
            const profile = await MissionProfileLogicService.updateProfile(episodeId, req.body);
            res.status(200).json(profile);
        } catch (error) {
            next(error);
        }
    }
}

export default new MissionProfileController();