
import { Router } from 'express';
import EpisodeController from '../controllers/episodeController';
import { UserRole } from '../../../infrastructure/middleware/common/enums';
import validateToken from '../../../infrastructure/middleware/valdiateToken/validateToken';
import validateRole from '../../../infrastructure/middleware/validateRole/validateRole';

import { sceneRoutes, standaloneSceneRoutes } from '../../scenes/routes/sceneRoutes';
import playthroughRoutes from '../../narrative/routes/playthroughRoutes';
import playerStateRoutes from '../../player-progress/routes/playerStateRoutes';
import { episodeRoleRoutes, standaloneRoleRoutes } from './narrativeRoleRoutes';
import missionProfileRoutes from '../../space-mission/routes/missionProfileRoutes';
 
const episodeRoutes = Router(); 
const adminOnly = [validateToken, validateRole(UserRole.Admin)]; 
const loggedInUsers = [validateToken]; 

episodeRoutes.get('/', loggedInUsers, EpisodeController.getAllEpisodes);
episodeRoutes.post('/', adminOnly, EpisodeController.createEpisode);
episodeRoutes.put('/:episodeId', adminOnly, EpisodeController.updateEpisode); // 🔥 NUEVO ENDPOINT

episodeRoutes.use('/:episodeId/scenes', sceneRoutes);
episodeRoutes.use('/scenes', standaloneSceneRoutes);
episodeRoutes.use('/:episodeId/roles', episodeRoleRoutes);
episodeRoutes.use('/roles', standaloneRoleRoutes);
episodeRoutes.use('/:episodeId/mission-profile', missionProfileRoutes);

episodeRoutes.use('/playthroughs', validateToken, playthroughRoutes);
episodeRoutes.use('/:episodeId/save-slots', validateToken, playerStateRoutes);

export default episodeRoutes;