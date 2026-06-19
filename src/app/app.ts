
// src/app/app.ts
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { initializeChatbot } from '../infrastructure/chatbot/chatbot.client'; // 🔥 Cambiamos el import
import { defineDatabaseAssociations, syncDatabase } from '../infrastructure/database/connection';
import AuthService from '../features/auth/services/auth.service';
import EpisodeService from '../features/episodes/services/episodeService';
import assetRoutes from '../features/episodes/routes/assetRoutes';
import prefabRoutes from '../features/episodes/routes/prefabRoutes'; 
import { errorMiddleware } from '../infrastructure/middleware/error.middleware'; 

dotenv.config();

class Server {
    private app: Application;
    private port: string;

    constructor() {
        this.app = express();
        this.port = process.env.PORT || '4000';
        this.initializeServer(); 
    }

    private async initializeServer(): Promise<void> {
        try {
            console.log("[Server] Iniciando secuencia de arranque...");
            defineDatabaseAssociations();
            await syncDatabase();
            this.configureMiddlewares();
            this.configureRoutes();
            
            // Levantamos el puerto HTTP primero
            this.startListening();

            // 🔥 AISLAMIENTO: Iniciamos el bot SIN 'await'. 
            // De esta forma corre en un proceso en segundo plano (background). 
            // Si Puppeteer colapsa, el servidor Express (API) seguirá funcionando intacto.
            initializeChatbot();

        } catch (error) {
            console.error("❌ Fallo crítico durante el arranque del servidor.", error);
            process.exit(1); 
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
    }

    private configureRoutes(): void {
        const authService = new AuthService();
        const episodeService = new EpisodeService();

        this.app.use('/auth/user', authService.getRouter());
        this.app.use('/api/episodes', episodeService.getRouter());
        this.app.use('/api/assets', assetRoutes);
        this.app.use('/api/prefabs', prefabRoutes);

        this.app.get('/health', (_req: Request, res: Response) => {
            res.status(200).json({ status: 'ok', message: 'Server is healthy' });
        });

        this.app.use(errorMiddleware);
    }

    private startListening(): void {
        this.app.listen(this.port, () => {
            console.log(`🚀 [Server] Servidor escuchando en el puerto ${this.port}`);
        });
    }
}

new Server();