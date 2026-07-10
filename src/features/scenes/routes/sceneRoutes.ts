import { Router } from 'express';
import SceneController from '../controllers/sceneController';
import { UserRole } from '../../../infrastructure/middleware/common/enums';
import validateToken from '../../../infrastructure/middleware/valdiateToken/validateToken';
import validateRole from '../../../infrastructure/middleware/validateRole/validateRole';
// 🔥 FIX: Import relativo correcto
import sceneObjectRoutes from '../../episodes/routes/sceneObjectRoutes';
 
// Habilitar mergeParams para recuperar el episodeId desde el enrutador padre
const sceneRoutes = Router({ mergeParams: true });
const adminOnly = [validateToken, validateRole(UserRole.Admin)];
const loggedInUsers = [validateToken];

// GET /api/episodes/:episodeId/scenes
sceneRoutes.get('/', loggedInUsers, SceneController.getScenesByEpisode);
// POST /api/episodes/:episodeId/scenes
sceneRoutes.post('/', adminOnly, SceneController.createScene);

// Estas rutas no usan el parameter del padre en el frontend, se montarán directo.
const standaloneSceneRoutes = Router({ mergeParams: true });
// GET /api/episodes/scenes/:sceneId
standaloneSceneRoutes.get('/:sceneId', loggedInUsers, SceneController.getSceneFull);
// POST /api/episodes/scenes/:sceneId/save-map
standaloneSceneRoutes.post('/:sceneId/save-map', adminOnly, SceneController.saveSceneMap);

// Montaje hijo para objetos: /api/episodes/scenes/:sceneId/objects
standaloneSceneRoutes.use('/:sceneId/objects', sceneObjectRoutes);

export { sceneRoutes, standaloneSceneRoutes };