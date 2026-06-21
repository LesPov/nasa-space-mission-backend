
import { NextFunction, Request, Response } from 'express';
import EpisodeLogicService from '../services/episodeLogicService';

// 🔥 DTO Validator estricto implementado de forma nativa para no forzar dependencias nuevas
const validateSaveMapDTO = (data: any) => {
    if (!data || typeof data !== 'object') {
        throw new Error("Payload inválido. Se esperaba un objeto JSON.");
    }
    
    if (data.sceneObjectsDelta && !Array.isArray(data.sceneObjectsDelta)) {
        throw new Error("sceneObjectsDelta debe ser un array válido.");
    }
    
    if (data.triggersDelta && !Array.isArray(data.triggersDelta)) {
        throw new Error("triggersDelta debe ser un array válido.");
    }
    
    if (data.deletedObjects && !Array.isArray(data.deletedObjects)) {
        throw new Error("deletedObjects debe ser un array válido.");
    }
    
    if (data.deletedTriggers && !Array.isArray(data.deletedTriggers)) {
        throw new Error("deletedTriggers debe ser un array válido.");
    }

    // Validación básica de los elementos para asegurar integridad
    (data.sceneObjectsDelta || []).forEach((obj: any, index: number) => {
        if (!obj.uid || typeof obj.uid !== 'string') throw new Error(`El objeto en sceneObjectsDelta[${index}] carece de UID válido.`);
        if (!obj.type || typeof obj.type !== 'string') throw new Error(`El objeto en sceneObjectsDelta[${index}] carece de TYPE válido.`);
        if (!obj.position || typeof obj.position !== 'object') throw new Error(`El objeto en sceneObjectsDelta[${index}] requiere POSITION.`);
    });
};

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
            validateSaveMapDTO(req.body);

            const { sceneObjectsDelta, triggersDelta, deletedObjects, deletedTriggers, worldSettings, uiSettings, title, description } = req.body;
            
            const response = await EpisodeLogicService.saveFullMap(
                Number(req.params.id),
                sceneObjectsDelta || [],
                triggersDelta || [],
                deletedObjects || [],
                deletedTriggers || [],
                worldSettings,
                uiSettings,
                title,
                description
            );
            
            res.status(200).json(response);
        } catch (error: any) {
            res.status(400).json({ message: 'Error de validación DTO al guardar el mapa', error: error.message });
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