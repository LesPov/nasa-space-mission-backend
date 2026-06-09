import { Router } from 'express';
import EpisodeController from '../controllers/episodeController';
import { UserRole } from '../../../infrastructure/middleware/common/enums';
import validateToken from '../../../infrastructure/middleware/valdiateToken/validateToken';
import validateRole from '../../../infrastructure/middleware/validateRole/validateRole';
import sceneObjectRoutes from './sceneObjectRoutes';
import playerStateRoutes from './playerStateRoutes';

const episodeRoutes = Router();
const adminOnly = [validateToken, validateRole(UserRole.Admin)];

// 👇 ESTA ERA LA RUTA QUE FALTABA PARA VER TODOS TUS MAPAS AL INICIAR
episodeRoutes.get('/', adminOnly, EpisodeController.getAllEpisodes);

// Crear nivel
episodeRoutes.post('/', adminOnly, EpisodeController.createEpisode);

// Obtener un nivel específico
episodeRoutes.get('/:id', adminOnly, EpisodeController.getEpisodeFull);

// Guardar el mapa
episodeRoutes.post('/:id/save-map', adminOnly, EpisodeController.saveMap);

// Guardar historia
episodeRoutes.post('/:id/save-dialogues', adminOnly, EpisodeController.saveDialogues);

episodeRoutes.use('/:episodeId/objects', sceneObjectRoutes);
episodeRoutes.use('/:episodeId/save-slots', validateToken, playerStateRoutes);

export default episodeRoutes;