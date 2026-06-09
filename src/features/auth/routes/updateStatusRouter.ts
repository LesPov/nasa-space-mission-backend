// updateStatusRouter.ts
import { Router } from "express";
import validateToken from "../../../infrastructure/middleware/valdiateToken/validateToken";
import { updateStatus } from "../../../infrastructure/middleware/updatestatus/updateStatus";
 


const updateStatusRouter = Router();
updateStatusRouter.put('/', validateToken, updateStatus);

export default updateStatusRouter;
