import { Router } from 'express';
import PlaythroughController from '../controllers/playthroughController';

// Merge params para soportar rutas montadas anidadas si se requiere a futuro
const playthroughRoutes = Router({ mergeParams: true });

playthroughRoutes.post('/start', PlaythroughController.startPlaythrough);
playthroughRoutes.get('/:playthroughId', PlaythroughController.getState);
playthroughRoutes.post('/:playthroughId/events', PlaythroughController.processEvent);

export default playthroughRoutes;