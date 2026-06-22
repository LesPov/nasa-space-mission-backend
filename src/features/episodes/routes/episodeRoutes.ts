
import EpisodeController from '../controllers/episodeController';
import { UserRole } from '../../../infrastructure/middleware/common/enums';
import validateToken from '../../../infrastructure/middleware/valdiateToken/validateToken';
import validateRole from '../../../infrastructure/middleware/validateRole/validateRole';
import sceneObjectRoutes from './sceneObjectRoutes';
import playthroughRoutes from './playthroughRoutes';
import { Router } from 'express';
  
const episodeRoutes = Router();
const adminOnly = [validateToken, validateRole(UserRole.Admin)]; 
const loggedInUsers = [validateToken]; 

episodeRoutes.get('/', loggedInUsers, EpisodeController.getAllEpisodes);
episodeRoutes.post('/', adminOnly, EpisodeController.createEpisode);

// Gestión de Escenas / Plataformas
episodeRoutes.get('/:episodeId/scenes', loggedInUsers, EpisodeController.getScenesByEpisode);
episodeRoutes.post('/:episodeId/scenes', adminOnly, EpisodeController.createScene);

episodeRoutes.get('/scenes/:sceneId', loggedInUsers, EpisodeController.getSceneFull);
episodeRoutes.post('/scenes/:sceneId/save-map', adminOnly, EpisodeController.saveSceneMap);

// Montaje de rutas hijas
episodeRoutes.use('/playthroughs', validateToken, playthroughRoutes);
episodeRoutes.use('/scenes/:sceneId/objects', sceneObjectRoutes);

export default episodeRoutes;