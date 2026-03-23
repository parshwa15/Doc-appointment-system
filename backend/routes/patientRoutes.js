import express from "express";
import {
  addReview,
  bookAppointmentByPatient,
  getDoctors,
  getMyAppointments,
  loginPatient,
  registerPatient,
} from "../controllers/patientController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", upload.single("profilePhoto"), registerPatient);
router.post("/login", loginPatient);
router.get("/doctors", getDoctors);
router.post("/book-appointment", protect, authorizeRoles("patient"), bookAppointmentByPatient);
router.get("/appointments", protect, authorizeRoles("patient"), getMyAppointments);
router.post("/review", protect, authorizeRoles("patient"), addReview);

export default router;
