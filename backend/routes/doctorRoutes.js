import express from "express";
import {
  addPrescription,
  addTimeSlot,
  getDoctorAppointments,
  loginDoctor,
  updateDoctorAppointmentStatus,
} from "../controllers/doctorController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginDoctor);
router.get("/appointments", protect, authorizeRoles("doctor"), getDoctorAppointments);
router.put("/update-status/:id", protect, authorizeRoles("doctor"), updateDoctorAppointmentStatus);
router.post("/add-prescription", protect, authorizeRoles("doctor"), addPrescription);
router.post("/add-timeslot", protect, authorizeRoles("doctor"), addTimeSlot);

export default router;
