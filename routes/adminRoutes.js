import { Router } from "express";
import {
  addOpportunity,
  getAllBeneficiaries,
  getAllOpportunities,
  addCommunity,
  deleteCommunityPost,
  updateBeneficiaryStatus,
  saveSponsor,
  getallSponosors,
  getallSponosorsFromUsersTable,
} from "../controllers/adminController.js";
import authenticateToken from "../middlewares/authMiddleware.js";
import authorizeRoles from "../middlewares/roleMiddleware.js";

const router = Router();

// Apply authentication and role authorization for all admin routes
router.use(authenticateToken, authorizeRoles("ADMIN"));

// Admin routes
router.post("/opportunity", addOpportunity);
router.get("/opportunity", getAllOpportunities);
router.get("/beneficiaries", getAllBeneficiaries);

router.post("/community", addCommunity);
router.delete("/post/:postId", deleteCommunityPost);

router.put("/beneficiary/status", updateBeneficiaryStatus);
router.post("/sponsor", saveSponsor);

router.get("/sponsor", getallSponosors);
router.get("/sponsorusers", getallSponosorsFromUsersTable);

export default router;
