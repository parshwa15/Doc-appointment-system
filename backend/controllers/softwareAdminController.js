import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Hospital from "../models/Hospital.js";
import HospitalAdmin from "../models/HospitalAdmin.js";
import SoftwareAdmin from "../models/SoftwareAdmin.js";

const createToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

export const registerSoftwareAdmin = async (req, res) => {
  try {
    const { name, email, password, contactNo } = req.body;

    const existing = await SoftwareAdmin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await SoftwareAdmin.create({
      name,
      email,
      password: hashedPassword,
      contactNo,
      profilePhoto: req.file?.path || "",
    });

    return res.status(201).json({
      message: "Software admin created",
      admin,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const loginSoftwareAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await SoftwareAdmin.findOne({ email });

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken({
      id: admin._id,
      role: "softwareAdmin",
      hospitalId: null,
    });

    return res.json({
      message: "Login successful",
      token,
      admin,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createHospital = async (req, res) => {
  try {
    const {
      name,
      address,
      contactNo,
      description,
      adminName,
      adminEmail,
      adminPassword,
      adminContactNo,
    } = req.body;

    if (
      !name ||
      !address ||
      !contactNo ||
      !adminName ||
      !adminEmail ||
      !adminPassword ||
      !adminContactNo
    ) {
      return res.status(400).json({
        message:
          "Please provide hospital details and hospital admin details (name, email, password, contact no)",
      });
    }

    const normalizedAdminEmail = adminEmail.toLowerCase().trim();

    const existingAdmin = await HospitalAdmin.findOne({ email: normalizedAdminEmail });
    if (existingAdmin) {
      return res.status(400).json({ message: "Hospital admin email already registered" });
    }

    const existingHospital = await Hospital.findOne({ name: name.trim() });
    if (existingHospital) {
      return res.status(400).json({ message: "Hospital name already exists" });
    }

    const hospital = await Hospital.create({
      name: name.trim(),
      address,
      contactNo,
      description,
      logo: req.file?.path || "",
    });

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const hospitalAdmin = await HospitalAdmin.create({
      name: adminName,
      email: normalizedAdminEmail,
      password: hashedPassword,
      contactNo: adminContactNo,
      hospitalId: hospital._id,
    });

    return res.status(201).json({
      message: "Hospital and hospital admin created",
      hospital,
      hospitalAdminCredentials: {
        adminId: hospitalAdmin.adminId,
        email: normalizedAdminEmail,
        password: adminPassword,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern?.name) {
        return res.status(400).json({ message: "Hospital name already exists" });
      }
      if (error.keyPattern?.email) {
        return res.status(400).json({ message: "Hospital admin email already registered" });
      }
    }
    return res.status(500).json({ message: error.message });
  }
};

export const getHospitals = async (_req, res) => {
  try {
    const hospitals = await Hospital.find().sort({ createdAt: -1 });

    const hospitalIds = hospitals.map((hospital) => hospital._id);
    const hospitalAdmins = await HospitalAdmin.find({
      hospitalId: { $in: hospitalIds },
    }).select("adminId name email contactNo hospitalId");

    const adminByHospitalId = new Map(
      hospitalAdmins.map((admin) => [String(admin.hospitalId), admin])
    );

    const hospitalsWithAdmin = hospitals.map((hospital) => {
      const hospitalObject = hospital.toObject();
      hospitalObject.hospitalAdmin = adminByHospitalId.get(String(hospital._id)) || null;
      return hospitalObject;
    });

    return res.json(hospitalsWithAdmin);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateHospital = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file?.path) {
      updateData.logo = req.file.path;
    }

    const hospital = await Hospital.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    return res.json({ message: "Hospital updated", hospital });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteHospital = async (req, res) => {
  try {
    const hospital = await Hospital.findByIdAndDelete(req.params.id);

    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    return res.json({ message: "Hospital deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getSoftwareAdminProfile = async (req, res) => {
  try {
    const admin = await SoftwareAdmin.findById(req.user.id).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Software admin not found" });
    }

    return res.json(admin);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateSoftwareAdminProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase().trim();
      const existing = await SoftwareAdmin.findOne({
        email: updateData.email,
        _id: { $ne: req.user.id },
      });

      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    if (req.file?.path) {
      updateData.profilePhoto = req.file.path;
    }

    const admin = await SoftwareAdmin.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!admin) {
      return res.status(404).json({ message: "Software admin not found" });
    }

    return res.json({ message: "Profile updated", admin });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createHospitalAdminBySoftwareAdmin = async (req, res) => {
  try {
    const { hospitalId, name, email, password, contactNo } = req.body;

    if (!hospitalId || !name || !email || !password || !contactNo) {
      return res.status(400).json({ message: "hospitalId, name, email, password and contactNo are required" });
    }

    const hospital = await Hospital.findById(hospitalId);
    if (!hospital) {
      return res.status(404).json({ message: "Hospital not found" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingAdmin = await HospitalAdmin.findOne({ email: normalizedEmail });
    if (existingAdmin) {
      return res.status(400).json({ message: "Hospital admin email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await HospitalAdmin.create({
      hospitalId,
      name,
      email: normalizedEmail,
      password: hashedPassword,
      contactNo,
    });

    return res.status(201).json({
      message: "Hospital admin created",
      hospitalAdmin: admin,
      credentials: {
        adminId: admin.adminId,
        email: normalizedEmail,
        password,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getHospitalAdminsBySoftwareAdmin = async (_req, res) => {
  try {
    const admins = await HospitalAdmin.find()
      .select("adminId name email contactNo hospitalId createdAt")
      .populate("hospitalId", "name")
      .sort({ createdAt: -1 });

    return res.json(admins);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateHospitalAdminBySoftwareAdmin = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(updateData, "password")) {
      return res.status(403).json({ message: "Hospital admin password update is not allowed" });
    }

    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase().trim();
      const existing = await HospitalAdmin.findOne({
        email: updateData.email,
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return res.status(400).json({ message: "Hospital admin email already registered" });
      }
    }

    const admin = await HospitalAdmin.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .select("adminId name email contactNo hospitalId createdAt")
      .populate("hospitalId", "name");

    if (!admin) {
      return res.status(404).json({ message: "Hospital admin not found" });
    }

    return res.json({ message: "Hospital admin updated", hospitalAdmin: admin });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteHospitalAdminBySoftwareAdmin = async (req, res) => {
  try {
    const admin = await HospitalAdmin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ message: "Hospital admin not found" });
    }

    return res.json({ message: "Hospital admin deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
