import express from "express";
import { getAllAppointments } from "../controllers/appointmentController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  protect,
  authorizeRoles("softwareAdmin", "hospitalAdmin"),
  getAllAppointments
);

export default router;
