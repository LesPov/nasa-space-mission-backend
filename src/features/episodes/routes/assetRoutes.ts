import { Router, Request, Response, NextFunction } from 'express';
import AssetController from '../controllers/assetController';
import { uploadAsset } from '../../../infrastructure/uploadsfiles/assetUploadConfig';
import { UserRole } from '../../../infrastructure/middleware/common/enums';
import validateToken from '../../../infrastructure/middleware/valdiateToken/validateToken';
import validateRole from '../../../infrastructure/middleware/validateRole/validateRole';

const assetRoutes = Router();
const adminOnly = [validateToken, validateRole(UserRole.Admin)];

// --- RUTA PARA SUBIR UN NUEVO ASSET LOCAL ---
// 🔥 FIX ERROR 500: Envolvemos a Multer en un callback para capturar sus errores 
// y convertirlos en JSON (Error 400) en lugar de tumbar el servidor (Error 500).
assetRoutes.post(
    '/upload',
    adminOnly,
    (req: Request, res: Response, next: NextFunction) => {
        uploadAsset.single('assetFile')(req, res, (err: any) => {
            if (err) {
                console.error("[Multer Error] Fallo al procesar archivo:", err.message);
                return res.status(400).json({ 
                    message: 'Error procesando el archivo. Puede que exceda el límite de 100MB o tenga mal formato.', 
                    error: err.message 
                });
            }
            next();
        });
    },
    AssetController.uploadAsset
);

// --- RUTA PARA OBTENER TODOS LOS ASSETS ---
assetRoutes.get('/', adminOnly, AssetController.getAllAssets);

export default assetRoutes;