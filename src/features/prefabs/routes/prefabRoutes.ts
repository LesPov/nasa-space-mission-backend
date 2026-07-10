
import { Router } from 'express';
import PrefabController from '../controllers/prefabController';
import { UserRole } from '../../../infrastructure/middleware/common/enums';
import validateToken from '../../../infrastructure/middleware/valdiateToken/validateToken';
import validateRole from '../../../infrastructure/middleware/validateRole/validateRole';

const prefabRoutes = Router();
const adminOnly = [validateToken, validateRole(UserRole.Admin)];

prefabRoutes.get('/', adminOnly, PrefabController.getAllPrefabs);
prefabRoutes.post('/', adminOnly, PrefabController.createPrefab);
prefabRoutes.delete('/:id', adminOnly, PrefabController.deletePrefab);

export default prefabRoutes;