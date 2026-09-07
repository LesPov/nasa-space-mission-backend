
import { Router } from 'express';
import NarrativeRoleController from '../controllers/narrativeRoleController';
import validateToken from '../../../infrastructure/middleware/valdiateToken/validateToken';
import validateRole from '../../../infrastructure/middleware/validateRole/validateRole';
import { UserRole } from '../../../infrastructure/middleware/common/enums';

const adminOnly = [validateToken, validateRole(UserRole.Admin)];

export const episodeRoleRoutes = Router({ mergeParams: true });
episodeRoleRoutes.get('/', validateToken, NarrativeRoleController.getRoles);
episodeRoleRoutes.post('/', adminOnly, NarrativeRoleController.createRole);

export const standaloneRoleRoutes = Router({ mergeParams: true });
standaloneRoleRoutes.put('/:roleId', adminOnly, NarrativeRoleController.updateRole);
standaloneRoleRoutes.delete('/:roleId', adminOnly, NarrativeRoleController.deleteRole);