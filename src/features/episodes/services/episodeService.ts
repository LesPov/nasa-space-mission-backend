// src/app/features/episodes/services/episodeService.ts
import { Router } from 'express';
import episodeRoutes from '../routes/episodeRoutes';

/**
 * EpisodeService (Manejador de Rutas)
 * Su ÚNICA responsabilidad es devolver el router principal para el feature
 * de episodios, que ya viene completamente configurado.
 */
class EpisodeService {
    private router: Router;

    constructor() {
        // Asignamos directamente el router de episodios.
        this.router = episodeRoutes;
        console.log('[EpisodeService] Servicio de rutas de episodios listo.');
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default EpisodeService;