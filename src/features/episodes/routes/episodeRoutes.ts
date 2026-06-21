
import { Router } from 'express';
import EpisodeController from '../controllers/episodeController';
import { UserRole } from '../../../infrastructure/middleware/common/enums';
import validateToken from '../../../infrastructure/middleware/valdiateToken/validateToken';
import validateRole from '../../../infrastructure/middleware/validateRole/validateRole';
import sceneObjectRoutes from './sceneObjectRoutes';
import playerStateRoutes from './playerStateRoutes';
const episodeRoutes = Router();
// Filtros de acceso
const adminOnly = [validateToken, validateRole(UserRole.Admin)]; // Solo administradores
const loggedInUsers = [validateToken]; // Cualquier usuario logueado (Jugador o Admin)
// 👇 FIX: Ahora cualquier usuario logueado puede VER la lista de mapas (Lobby)
episodeRoutes.get('/', loggedInUsers, EpisodeController.getAllEpisodes);
// Crear nivel (Solo Administradores)
episodeRoutes.post('/', adminOnly, EpisodeController.createEpisode);
// 👇 FIX: Ahora cualquier usuario logueado puede ENTRAR a jugar un mapa
episodeRoutes.get('/:id', loggedInUsers, EpisodeController.getEpisodeFull);
// Guardar el mapa (Solo Administradores)
episodeRoutes.post('/:id/save-map', adminOnly, EpisodeController.saveMap);
// Guardar historia (Solo Administradores)
episodeRoutes.post('/:id/save-dialogues', adminOnly, EpisodeController.saveDialogues);
episodeRoutes.use('/:episodeId/objects', sceneObjectRoutes);
episodeRoutes.use('/:episodeId/save-slots', validateToken, playerStateRoutes);
export default episodeRoutes;