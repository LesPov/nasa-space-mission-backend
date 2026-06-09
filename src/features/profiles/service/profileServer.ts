import dotenv from 'dotenv';
import express, { Application, Router } from 'express';
import cors from 'cors';
import { userProfileModel } from '../models/userProfileModel';
import registerPersonalData from '../routes/ProfileRoutes';

dotenv.config();

class ProfileServer {
    private router: Router;
    constructor() {
        this.router = Router();
        this.routes();
        this.dbConnect();

    }

    routes(): void {
        console.log('[AuthService] Montando sub-routers...');
        this.router.use('/user/profile', registerPersonalData);


    }


    async dbConnect() {
        try {
            await userProfileModel.sync();

            console.log('Modelos de agrored sincronizados correctamente.');
        } catch (error) {
            console.error('Error al sincronizar los modelos de denuncias:', error);
        }
    }

    getRouter(): Router { return this.router; }

}

export default ProfileServer;