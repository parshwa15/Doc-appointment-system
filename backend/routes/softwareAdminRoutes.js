import express from "express";
import {
  createHospitalAdminBySoftwareAdmin,
  createHospital,
  deleteHospitalAdminBySoftwareAdmin,
  deleteHospital,
  getHospitalAdminsBySoftwareAdmin,
  getHospitals,
  getSoftwareAdminProfile,
  loginSoftwareAdmin,
  registerSoftwareAdmin,
  updateHospitalAdminBySoftwareAdmin,
  updateHospital,
  updateSoftwareAdminProfile,
} from "../controllers/softwareAdminController.js";
import { authorizeRoles, protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", upload.single("profilePhoto"), registerSoftwareAdmin);
router.post("/login", loginSoftwareAdmin);
router.get("/profile", protect, authorizeRoles("softwareAdmin"), getSoftwareAdminProfile);
router.put(
  "/profile",
  protect,
  authorizeRoles("softwareAdmin"),
  upload.single("profilePhoto"),
  updateSoftwareAdminProfile
);

router.post(
  "/create-hospital",
  protect,
  authorizeRoles("softwareAdmin"),
  upload.single("logo"),
  createHospital
);
router.get("/hospitals", protect, authorizeRoles("softwareAdmin"), getHospitals);
router.put(
  "/update-hospital/:id",
  protect,
  authorizeRoles("softwareAdmin"),
  upload.single("logo"),
  updateHospital
);
router.delete(
  "/delete-hospital/:id",
  protect,
  authorizeRoles("softwareAdmin"),
  deleteHospital
);

router.post(
  "/create-hospital-admin",
  protect,
  authorizeRoles("softwareAdmin"),
  createHospitalAdminBySoftwareAdmin
);
router.get(
  "/hospital-admins",
  protect,
  authorizeRoles("softwareAdmin"),
  getHospitalAdminsBySoftwareAdmin
);
router.put(
  "/update-hospital-admin/:id",
  protect,
  authorizeRoles("softwareAdmin"),
  updateHospitalAdminBySoftwareAdmin
);
router.delete(
  "/delete-hospital-admin/:id",
  protect,
  authorizeRoles("softwareAdmin"),
  deleteHospitalAdminBySoftwareAdmin
);

export default router;
