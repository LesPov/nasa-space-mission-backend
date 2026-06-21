
import { Router } from 'express';
import SceneObjectController from '../controllers/sceneObjectController';
import validateToken from '../../../infrastructure/middleware/valdiateToken/validateToken';

// mergeParams: true es obligatorio porque esta ruta se anida dentro de /episodes/:episodeId/
const sceneObjectRoutes = Router({ mergeParams: true });

// Permitimos a cualquier usuario logueado (jugador o admin) consultar un objeto individual si el Frontend lo llega a pedir
sceneObjectRoutes.get('/:objectId', validateToken, SceneObjectController.getObjectById);

export default sceneObjectRoutes;