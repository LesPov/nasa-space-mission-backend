import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { initializeChatbot } from '../infrastructure/chatbot/chatbot.client';
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
            console.log("[Server] Iniciando secuencia de arranque rápido...");
            
            defineDatabaseAssociations();
            await syncDatabase();
            
            this.configureMiddlewares();
            this.configureRoutes();
            
            this.startListening();
        } catch (error) {
            console.error("❌ Fallo crítico durante el arranque del servidor.", error);
            process.exit(1); 
        }
    }

    private configureMiddlewares(): void {
        this.app.set('trust proxy', 1);

        // Cabeceras de seguridad básicas
        this.app.use((_req, res, next) => {
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            next();
        });

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

        // 🔥 OPTIMIZACIÓN: No comprimir archivos 3D/Multimedia, ahorra muchísima CPU en el backend
        this.app.use(compression({
            filter: (req, res) => {
                if (req.headers['x-no-compression']) { return false; }
                if (req.url.match(/\.(glb|mp4|webm|png|jpg|jpeg)$/i)) { return false; }
                return compression.filter(req, res);
            }
        }));

        // 🔥 PROTECCIÓN DE MEMORIA: Reducimos de 150mb a 25mb para evitar bloqueos del Event Loop.
        // Las subidas de 100mb de GLB usan Multer (form-data), no express.json.
        const bodyLimit = process.env.BODY_LIMIT || '25mb';
        this.app.use(express.json({ limit: bodyLimit }));
        this.app.use(express.urlencoded({ extended: true, limit: bodyLimit }));

        // 🔥 CACHÉ ULTRA AGRESIVA: Los assets servidos al frontend se guardan en el disco del navegador por 1 año.
        const uploadsPath = path.resolve(process.cwd(), 'uploads');
        this.app.use('/uploads', express.static(uploadsPath, {
            maxAge: '1y',
            immutable: true, 
            etag: false 
        }));
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
            console.log(`🚀 [Server] Servidor API Express escuchando en el puerto ${this.port}`);
            
            setTimeout(() => {
                initializeChatbot().catch(err => console.error("Error en background bot:", err));
            }, 2000);
        });
    }
}

new Server();