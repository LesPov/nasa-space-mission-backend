/**
 * @file adminServices.ts
 * @description Servicio que agrupa los routers del módulo de administración.
 */
import { Router } from 'express';
import dotenv from 'dotenv';
import authRouter from '../routes/auth.router';
 
dotenv.config();

class AuthService {
    private router: Router;
    constructor() {
        this.router = Router();
        this.routes();

    }


    routes(): void {
        console.log('[AuthService] Montando sub-routers...');
        this.router.use(authRouter);


    }

    getRouter(): Router { return this.router; }


}
export default AuthService;
