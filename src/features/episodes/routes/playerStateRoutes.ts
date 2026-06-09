import { Router } from 'express';
import PlayerStateController from '../controllers/playerStateController';
import validateToken from '../../../infrastructure/middleware/valdiateToken/validateToken';

// mergeParams permite capturar el episodeId de la ruta superior
const playerStateRoutes = Router({ mergeParams: true });

// A diferencia del editor (Admin), estas rutas las usa el JUGADOR normal
playerStateRoutes.get('/:slot', validateToken, PlayerStateController.loadGame);
playerStateRoutes.post('/:slot', validateToken, PlayerStateController.saveGame);

export default playerStateRoutes;