import { Router } from "express";
import { assignBeneficiary } from "../controllers/sponsorController.js";
import authenticateToken from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

const router = Router();

// All routes here require authentication and sponsor role
router.use(authenticateToken, authorizeRoles("SPONSOR"));

// POST /api/sponsors/assign
router.post("/assign", assignBeneficiary);

export default router;
