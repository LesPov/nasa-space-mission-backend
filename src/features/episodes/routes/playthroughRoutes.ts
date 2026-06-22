import { Router } from 'express';
import PlaythroughController from '../controllers/playthroughController';

// Rutas para el Motor de Estado del Backend (Client envía eventos, Backend decide)
const playthroughRoutes = Router();

playthroughRoutes.post('/start', PlaythroughController.startPlaythrough);
playthroughRoutes.get('/:playthroughId', PlaythroughController.getState);
playthroughRoutes.post('/:playthroughId/events', PlaythroughController.processEvent);

export default playthroughRoutes;