
import { Router } from 'express';
import EpisodeController from '../controllers/episodeController';
import { UserRole } from '../../../infrastructure/middleware/common/enums';
import validateToken from '../../../infrastructure/middleware/valdiateToken/validateToken';
import validateRole from '../../../infrastructure/middleware/validateRole/validateRole';

import { sceneRoutes, standaloneSceneRoutes } from '../../scenes/routes/sceneRoutes';
import playthroughRoutes from '../../narrative/routes/playthroughRoutes';
import playerStateRoutes from '../../player-progress/routes/playerStateRoutes';
import { episodeRoleRoutes, standaloneRoleRoutes } from './narrativeRoleRoutes';
 
const episodeRoutes = Router();
const adminOnly = [validateToken, validateRole(UserRole.Admin)]; 
const loggedInUsers = [validateToken]; 

episodeRoutes.get('/', loggedInUsers, EpisodeController.getAllEpisodes);
episodeRoutes.post('/', adminOnly, EpisodeController.createEpisode);

// Redirige /api/episodes/:episodeId/scenes -> Features/Scenes
episodeRoutes.use('/:episodeId/scenes', sceneRoutes);
episodeRoutes.use('/scenes', standaloneSceneRoutes);

// 🔥 GESTIÓN DE ROLES NARRATIVOS (FASE 1)
episodeRoutes.use('/:episodeId/roles', episodeRoleRoutes);
episodeRoutes.use('/roles', standaloneRoleRoutes);

// Rutas Narrativas y Progreso
episodeRoutes.use('/playthroughs', validateToken, playthroughRoutes);
episodeRoutes.use('/:episodeId/save-slots', validateToken, playerStateRoutes);

export default episodeRoutes;