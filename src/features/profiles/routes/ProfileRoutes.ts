import { Router } from "express";
import { getProfileController } from "../controllers/getprofile";
import validateToken from "../../../infrastructure/middleware/valdiateToken/validateToken";
import validateRole from "../../../infrastructure/middleware/validateRole/validateRole";
import { updateProfileController } from "../controllers/updateProfileController";
import { updateMinimalProfileController } from "../controllers/updateMinimalProfileController ";
 
const registerPersonalData = Router();

registerPersonalData.put(
    '/user/update-profile',
    validateToken,
    validateRole(['user', 'admin']), 
    updateProfileController
); 

registerPersonalData.put(
    '/user/update-minimal-profile',
    validateToken,
    validateRole(['user']),
    updateMinimalProfileController
);

registerPersonalData.get(
    '/me',
    validateToken,
    validateRole(['user', 'admin']),
    getProfileController
);

export default registerPersonalData; 