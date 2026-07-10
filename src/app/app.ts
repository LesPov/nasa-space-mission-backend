import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

import { initializeChatbot } from '../infrastructure/chatbot/chatbot.client';
import { defineDatabaseAssociations, syncDatabase } from '../infrastructure/database/connection';
import AuthService from '../features/auth/services/auth.service';
import EpisodeService from '../features/episodes/services/episodeService';
import assetRoutes from '../features/assets/routes/assetRoutes';
import prefabRoutes from '../features/prefabs/routes/prefabRoutes'; 
import { errorMiddleware } from '../infrastructure/middleware/error.middleware'; 

import validateToken from '../infrastructure/middleware/valdiateToken/validateToken';
import validateRole from '../infrastructure/middleware/validateRole/validateRole';
import { UserRole } from '../infrastructure/middleware/common/enums';

// 🔥 Importamos los modelos para forzar la creación/actualización de usuarios correcta
import { AuthModel } from '../features/auth/models/authModel';
import { VerificationModel } from '../features/auth/models/verificationModel';
import { userProfileModel } from '../features/profiles/models/userProfileModel';

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

        // =====================================================================
        // 🔥 RUTA PARA RESETEAR/CREAR USUARIOS Y LIMPIAR INTENTOS FALLIDOS
        // Protegida: Solo Admin, y no se registra en Producción
        // =====================================================================
        if (process.env.NODE_ENV !== 'production') {
            this.app.get(
                '/api/reset-users', 
                validateToken, 
                validateRole(UserRole.Admin), 
                async (_req: Request, res: Response) => {
                    try {
                        // 1. Hasheamos la contraseña de manera nativa y perfecta
                        const passwordPlana = '123456789Leo-';
                        const hashedPassword = await bcrypt.hash(passwordPlana, 10);

                        // ==========================================
                        // 2. CREAR / ACTUALIZAR USUARIO ADMIN
                        // ==========================================
                        let admin = await AuthModel.findOne({ where: { username: 'admin' } });
                        if (admin) {
                            await admin.update({ password: hashedPassword, status: 'Activado' });
                        } else {
                            admin = await AuthModel.create({
                                username: 'admin',
                                password: hashedPassword,
                                email: 'admin@motor3d.com',
                                phoneNumber: '3000000000',
                                rol: 'admin',
                                status: 'Activado'
                            } as any);
                        }

                        // Limpiar intentos fallidos y bloqueos del Admin
                        let adminVerif = await VerificationModel.findOne({ where: { userId: admin.id } });
                        if (adminVerif) {
                            await adminVerif.update({ isVerified: true, isEmailVerified: true, isPhoneVerified: true, loginAttempts: 0, blockExpiration: null });
                        } else {
                            await VerificationModel.create({
                                userId: admin.id, isVerified: true, isEmailVerified: true, isPhoneVerified: true, loginAttempts: 0
                            } as any);
                        }

                        let adminProfile = await userProfileModel.findOne({ where: { userId: admin.id } });
                        if (!adminProfile) {
                            await userProfileModel.create({
                                userId: admin.id, firstName: 'Admin', lastName: 'Maestro', identificationType: 'Otro', identificationNumber: '111111111', birthDate: '1990-01-01', gender: 'Prefiero no declarar', status: 'aprobado'
                            } as any);
                        }

                        // ==========================================
                        // 3. CREAR / ACTUALIZAR USUARIO JUGADOR
                        // ==========================================
                        let jugador = await AuthModel.findOne({ where: { username: 'jugador1' } });
                        if (jugador) {
                            await jugador.update({ password: hashedPassword, status: 'Activado' });
                        } else {
                            jugador = await AuthModel.create({
                                username: 'jugador1',
                                password: hashedPassword,
                                email: 'jugador@motor3d.com',
                                phoneNumber: '3111111111',
                                rol: 'user',
                                status: 'Activado'
                            } as any);
                        }

                        // Limpiar intentos fallidos y bloqueos del Jugador
                        let jugadorVerif = await VerificationModel.findOne({ where: { userId: jugador.id } });
                        if (jugadorVerif) {
                            await jugadorVerif.update({ isVerified: true, isEmailVerified: true, isPhoneVerified: true, loginAttempts: 0, blockExpiration: null });
                        } else {
                            await VerificationModel.create({
                                userId: jugador.id, isVerified: true, isEmailVerified: true, isPhoneVerified: true, loginAttempts: 0
                            } as any);
                        }

                        let jugadorProfile = await userProfileModel.findOne({ where: { userId: jugador.id } });
                        if (!jugadorProfile) {
                            await userProfileModel.create({
                                userId: jugador.id, firstName: 'Jugador', lastName: 'Prueba', identificationType: 'Cédula', identificationNumber: '222222222', birthDate: '2000-01-01', gender: 'Hombre', status: 'aprobado'
                            } as any);
                        }

                        res.status(200).json({
                            mensaje: '✅ Usuarios reseteados y creados exitosamente. Los intentos fallidos han sido borrados.',
                            admin: 'admin',
                            jugador: 'jugador1',
                            password_para_ambos: passwordPlana
                        });
                    } catch (error: any) {
                        console.error('Error reseteando usuarios:', error);
                        res.status(500).json({ error: error.message });
                    }
                }
            );
        }

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