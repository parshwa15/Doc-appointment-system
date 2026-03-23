import express from "express";
import {
  bookAppointment,
  createDoctor,
  createHospitalAdmin,
  createPatient,
  deletePatient,
  deleteDoctor,
  getHospitalAdminProfile,
  getHospitalAppointments,
  getHospitalDoctors,
  getHospitalPatients,
  loginHospitalAdmin,
  updateAppointmentStatus,
  updateDoctor,
  updateHospitalAdminProfile,
  updatePatient,
} from "../controllers/hospitalAdminController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", upload.single("profilePhoto"), createHospitalAdmin);
router.post("/login", loginHospitalAdmin);
router.get("/profile", protect, authorizeRoles("hospitalAdmin"), getHospitalAdminProfile);
router.put(
  "/profile",
  protect,
  authorizeRoles("hospitalAdmin"),
  upload.single("profilePhoto"),
  updateHospitalAdminProfile
);

router.post(
  "/create-doctor",
  protect,
  authorizeRoles("hospitalAdmin"),
  upload.single("profilePhoto"),
  createDoctor
);
router.post(
  "/create-patient",
  protect,
  authorizeRoles("hospitalAdmin"),
  upload.single("profilePhoto"),
  createPatient
);
router.get("/doctors", protect, authorizeRoles("hospitalAdmin"), getHospitalDoctors);
router.get("/patients", protect, authorizeRoles("hospitalAdmin"), getHospitalPatients);
router.put(
  "/update-doctor/:id",
  protect,
  authorizeRoles("hospitalAdmin"),
  upload.single("profilePhoto"),
  updateDoctor
);
router.put(
  "/update-patient/:id",
  protect,
  authorizeRoles("hospitalAdmin"),
  upload.single("profilePhoto"),
  updatePatient
);
router.delete("/delete-doctor/:id", protect, authorizeRoles("hospitalAdmin"), deleteDoctor);
router.delete("/delete-patient/:id", protect, authorizeRoles("hospitalAdmin"), deletePatient);

router.post("/book-appointment", protect, authorizeRoles("hospitalAdmin"), bookAppointment);
router.get("/appointments", protect, authorizeRoles("hospitalAdmin"), getHospitalAppointments);
router.put(
  "/update-appointment-status/:id",
  protect,
  authorizeRoles("hospitalAdmin"),
  updateAppointmentStatus
);

export default router;
