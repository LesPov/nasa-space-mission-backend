import { Router } from 'express';
import MissionProfileController from '../controllers/missionProfileController';
import validateToken from '../../../infrastructure/middleware/valdiateToken/validateToken';
import validateRole from '../../../infrastructure/middleware/validateRole/validateRole';
import { UserRole } from '../../../infrastructure/middleware/common/enums';

// Obligatorio para heredar episodeId del router padre
const missionProfileRoutes = Router({ mergeParams: true });

const adminOnly = [validateToken, validateRole(UserRole.Admin)];

missionProfileRoutes.get('/', validateToken, MissionProfileController.getProfile);
missionProfileRoutes.post('/', adminOnly, MissionProfileController.createProfile);
missionProfileRoutes.put('/', adminOnly, MissionProfileController.updateProfile);

export default missionProfileRoutes;