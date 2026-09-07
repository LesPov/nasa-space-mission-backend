
import { NextFunction, Request, Response } from 'express';
import NarrativeRoleLogicService from '../services/narrativeRoleLogicService';

class NarrativeRoleController {
    public async getRoles(req: Request<{ episodeId: string }>, res: Response, next: NextFunction) {
        try {
            const roles = await NarrativeRoleLogicService.getRolesByEpisode(Number(req.params.episodeId));
            res.status(200).json(roles);
        } catch (error) { next(error); }
    }

    public async createRole(req: Request<{ episodeId: string }>, res: Response, next: NextFunction) {
        try {
            const role = await NarrativeRoleLogicService.createRole(Number(req.params.episodeId), req.body);
            res.status(201).json(role);
        } catch (error) { next(error); }
    }

    public async updateRole(req: Request<{ roleId: string }>, res: Response, next: NextFunction) {
        try {
            const role = await NarrativeRoleLogicService.updateRole(Number(req.params.roleId), req.body);
            res.status(200).json(role);
        } catch (error) { next(error); }
    }

    public async deleteRole(req: Request<{ roleId: string }>, res: Response, next: NextFunction) {
        try {
            await NarrativeRoleLogicService.deleteRole(Number(req.params.roleId));
            res.status(204).send();
        } catch (error) { next(error); }
    }
}
export default new NarrativeRoleController();