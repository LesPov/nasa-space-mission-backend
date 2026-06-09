// src/app/app.ts
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import client from '../infrastructure/chatbot/chatbot.client';
// --- Importaciones de Infraestructura y Servicios/Rutas ---
// ¡Importamos ambas funciones por separado para un control explícito!
import { defineDatabaseAssociations, syncDatabase } from '../infrastructure/database/connection';
import AuthService from '../features/auth/services/auth.service';
import EpisodeService from '../features/episodes/services/episodeService';
import assetRoutes from '../features/episodes/routes/assetRoutes';

dotenv.config();

class Server {
    private app: Application;
    private port: string;

    constructor() {
        this.app = express();
        this.port = process.env.PORT || '4000';
        this.initializeServer(); // Renombrado para mayor claridad
    }

    /**
     * Orquesta el arranque del servidor de forma secuencial y robusta.
     * Este es el NUEVO patrón de inicialización.
     */
    private async initializeServer(): Promise<void> {
        try {
            console.log("[Server] Iniciando secuencia de arranque...");

            // 1. Definir asociaciones de modelos.
            // Esto es necesario ANTES de sincronizar.
            defineDatabaseAssociations();

            // 2. Sincronizar la base de datos.
            // Si esto falla, la aplicación se detendrá aquí mismo.
            await syncDatabase();

            // 3. Configurar middlewares (CORS, JSON, etc.).
            this.configureMiddlewares();

            // 4. Configurar y montar las rutas.
            this.configureRoutes();

            // 5. Iniciar el servidor para escuchar peticiones.
            this.startListening();

        } catch (error) {
            console.error("❌ Fallo crítico durante el arranque del servidor. La aplicación se detendrá.", error);
            process.exit(1); // Detiene el proceso si la BD no se puede sincronizar
        }
    }

    private configureMiddlewares(): void {
        this.app.set('trust proxy', 1);

        const rawOrigins = process.env.ALLOWED_ORIGINS || '*';
        const allowedOrigins = rawOrigins.split(',').map(o => o.trim());
        const corsOptions: cors.CorsOptions = {
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
                    callback(null, true);
                } else {
                    callback(new Error(`Origen no permitido por CORS: ${origin}`));
                }
            },
            credentials: true,
        };
        this.app.use(cors(corsOptions));

        this.app.use(compression());
        const bodyLimit = process.env.BODY_LIMIT || '150mb';
        this.app.use(express.json({ limit: bodyLimit }));
        this.app.use(express.urlencoded({ extended: true, limit: bodyLimit }));

        const uploadsPath = path.resolve(process.cwd(), 'uploads');
        this.app.use('/uploads', express.static(uploadsPath));

        console.log("[Server] Middlewares configurados.");
    }

    private configureRoutes(): void {
        // Inicializar los servicios que contienen los routers
        const authService = new AuthService();
        const episodeService = new EpisodeService();

        // Montar las rutas
        this.app.use('/auth/user', authService.getRouter());
        this.app.use('/api/episodes', episodeService.getRouter());
        this.app.use('/api/assets', assetRoutes);

        this.app.get('/health', (_req: Request, res: Response) => {
            res.status(200).json({ status: 'ok', message: 'Server is healthy' });
        });

        console.log("[Server] Rutas configuradas.");
    }

    private startListening(): void {
        this.app.listen(this.port, () => {
            console.log(`🚀 [Server] Servidor escuchando en el puerto ${this.port}`);
        });
    }
}

// Inicia el servidor
new Server();