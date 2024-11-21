import { Router } from "express";
import authRoutes from "./authRoutes.js";
import adminRoutes from "./adminRoutes.js";
import sponsorRoutes from "./sponsorRoutes.js";
import publicroute from "./publictoute.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/public", publicroute);
router.use("/admin", adminRoutes);

router.use("/sponsors", sponsorRoutes);

export default router;
