import { Router } from "express";

import authenticateToken from "../middlewares/authMiddleware.js";
import {
  getAllCommunities,
  getCommunityPosts,
  joinCommunity,
  leaveCommunity,
} from "../controllers/userController.js";

const router = Router();

// Public or user-specific routes
router.get("/communities", getAllCommunities);
router.get("/community/:communityId/posts", getCommunityPosts);

// Authenticated user routes
router.post("/community/join", authenticateToken, joinCommunity);
router.post("/community/leave", authenticateToken, leaveCommunity);

export default router;
