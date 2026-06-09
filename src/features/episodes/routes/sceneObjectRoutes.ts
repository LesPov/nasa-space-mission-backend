import { Router } from 'express';
import SceneObjectController from '../controllers/sceneObjectController';
import { UserRole } from '../../../infrastructure/middleware/common/enums';
import validateRole from '../../../infrastructure/middleware/validateRole/validateRole';
import validateToken from '../../../infrastructure/middleware/valdiateToken/validateToken';

const sceneObjectRoutes = Router({ mergeParams: true });
const adminOnly = [validateToken, validateRole(UserRole.Admin)];

// Solo lectura individual (la escritura masiva la hace EpisodeRoutes)
sceneObjectRoutes.get('/:objectId', adminOnly, SceneObjectController.getObjectById);

export default sceneObjectRoutes;