import { Router, Request, Response, NextFunction } from 'express';
import AssetController from '../controllers/assetController';
import { uploadAsset } from '../../../infrastructure/uploadsfiles/assetUploadConfig';
import { UserRole } from '../../../infrastructure/middleware/common/enums';
import validateToken from '../../../infrastructure/middleware/valdiateToken/validateToken';
import validateRole from '../../../infrastructure/middleware/validateRole/validateRole';

const assetRoutes = Router();
const adminOnly = [validateToken, validateRole(UserRole.Admin)];

assetRoutes.post(
    '/upload',
    adminOnly,
    (req: Request, res: Response, next: NextFunction) => {
        uploadAsset.single('assetFile')(req, res, (err: any) => {
            if (err) {
                return res.status(400).json({ 
                    message: 'Error procesando el archivo. Límite o formato.', 
                    error: err.message 
                });
            }
            next();
        });
    },
    AssetController.uploadAsset
);

assetRoutes.get('/', adminOnly, AssetController.getAllAssets);

export default assetRoutes;