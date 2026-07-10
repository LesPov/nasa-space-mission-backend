import { Router } from 'express';
import EpisodeController from '../controllers/episodeController';
import { UserRole } from '../../../infrastructure/middleware/common/enums';
import validateToken from '../../../infrastructure/middleware/valdiateToken/validateToken';
import validateRole from '../../../infrastructure/middleware/validateRole/validateRole';

// Importamos rutas de los otros sub-dominios extraídos
import { sceneRoutes, standaloneSceneRoutes } from '../../scenes/routes/sceneRoutes';
import playthroughRoutes from '../../narrative/routes/playthroughRoutes';
import playerStateRoutes from '../../player-progress/routes/playerStateRoutes';
  
const episodeRoutes = Router();
const adminOnly = [validateToken, validateRole(UserRole.Admin)]; 
const loggedInUsers = [validateToken]; 

// Core Episodes
episodeRoutes.get('/', loggedInUsers, EpisodeController.getAllEpisodes);
episodeRoutes.post('/', adminOnly, EpisodeController.createEpisode);

// 🛡️ PATRÓN STRANGLER FIG: Actuamos como Proxy para no romper la API Front-End
// Redirige /api/episodes/:episodeId/scenes -> Features/Scenes
episodeRoutes.use('/:episodeId/scenes', sceneRoutes);

// Redirige /api/episodes/scenes -> Features/Scenes (Standalone)
episodeRoutes.use('/scenes', standaloneSceneRoutes);

// Redirige /api/episodes/playthroughs -> Features/Narrative
episodeRoutes.use('/playthroughs', validateToken, playthroughRoutes);

// Redirige /api/episodes/:episodeId/save-slots -> Features/Player-Progress
episodeRoutes.use('/:episodeId/save-slots', validateToken, playerStateRoutes);

export default episodeRoutes;