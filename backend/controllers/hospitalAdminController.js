import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import HospitalAdmin from "../models/HospitalAdmin.js";
import Patient from "../models/Patient.js";

const createToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

export const createHospitalAdmin = async (req, res) => {
  try {
    const { name, email, password, contactNo, hospitalId } = req.body;

    const existing = await HospitalAdmin.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await HospitalAdmin.create({
      name,
      email,
      password: hashedPassword,
      contactNo,
      hospitalId,
      profilePhoto: req.file?.path || "",
    });

    return res.status(201).json({ message: "Hospital admin created", admin });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const loginHospitalAdmin = async (req, res) => {
  try {
    const { adminId, email, password } = req.body;

    if (!adminId || !email || !password) {
      return res.status(400).json({ message: "adminId, email and password are required" });
    }

    const admin = await HospitalAdmin.findOne({ adminId, email: email.toLowerCase() }).populate(
      "hospitalId",
      "name"
    );
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken({
      id: admin._id,
      role: "hospitalAdmin",
      hospitalId: admin.hospitalId,
    });

    return res.json({
      message: "Login successful",
      token,
      admin,
      hospitalName: admin.hospitalId?.name || "",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createDoctor = async (req, res) => {
  try {
    const payload = { ...req.body };
    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const doctor = await Doctor.create({
      ...payload,
      password: hashedPassword,
      hospitalId: req.user.hospitalId,
      profilePhoto: req.file?.path || "",
    });

    return res.status(201).json({ message: "Doctor created", doctor });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createPatient = async (req, res) => {
  try {
    const payload = { ...req.body };

    if (payload.assignedDoctorId) {
      const assignedDoctor = await Doctor.findOne({
        _id: payload.assignedDoctorId,
        hospitalId: req.user.hospitalId,
      });

      if (!assignedDoctor) {
        return res.status(400).json({ message: "Assigned doctor is invalid for this hospital" });
      }
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const patient = await Patient.create({
      ...payload,
      password: hashedPassword,
      profilePhoto: req.file?.path || "",
    });

    return res.status(201).json({ message: "Patient created", patient });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getHospitalDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ hospitalId: req.user.hospitalId }).select("-password");
    return res.json(doctors);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getHospitalPatients = async (_req, res) => {
  try {
    const patients = await Patient.find().select("-password").populate("assignedDoctorId", "name doctorId");
    return res.json(patients);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateDoctor = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    if (req.file?.path) {
      updateData.profilePhoto = req.file.path;
    }

    const doctor = await Doctor.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.user.hospitalId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    return res.json({ message: "Doctor updated", doctor });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updatePatient = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(updateData, "assignedDoctorId")) {
      if (updateData.assignedDoctorId) {
        const assignedDoctor = await Doctor.findOne({
          _id: updateData.assignedDoctorId,
          hospitalId: req.user.hospitalId,
        });

        if (!assignedDoctor) {
          return res.status(400).json({ message: "Assigned doctor is invalid for this hospital" });
        }
      } else {
        updateData.assignedDoctorId = null;
      }
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    if (req.file?.path) {
      updateData.profilePhoto = req.file.path;
    }

    const patient = await Patient.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    return res.json({ message: "Patient updated", patient });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findOneAndDelete({
      _id: req.params.id,
      hospitalId: req.user.hospitalId,
    });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    return res.json({ message: "Doctor deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    return res.json({ message: "Patient deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const bookAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.create({
      ...req.body,
      hospitalId: req.user.hospitalId,
    });

    return res.status(201).json({ message: "Appointment booked", appointment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, hospitalId: req.user.hospitalId },
      { status },
      { new: true }
    )
      .populate("doctorId", "name doctorId")
      .populate("patientId", "name patientId");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    return res.json({ message: "Appointment updated", appointment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getHospitalAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ hospitalId: req.user.hospitalId })
      .populate("doctorId", "name doctorId profession")
      .populate("patientId", "name patientId")
      .sort({ createdAt: -1 });

    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getHospitalAdminProfile = async (req, res) => {
  try {
    const admin = await HospitalAdmin.findById(req.user.id)
      .select("-password")
      .populate("hospitalId", "name address");

    if (!admin) {
      return res.status(404).json({ message: "Hospital admin not found" });
    }

    return res.json(admin);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateHospitalAdminProfile = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(updateData, "password")) {
      return res.status(403).json({ message: "Hospital admin password update is not allowed" });
    }

    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase().trim();
      const existing = await HospitalAdmin.findOne({
        email: updateData.email,
        _id: { $ne: req.user.id },
      });

      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }
    }

    if (req.file?.path) {
      updateData.profilePhoto = req.file.path;
    }

    const admin = await HospitalAdmin.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    })
      .select("-password")
      .populate("hospitalId", "name address");

    if (!admin) {
      return res.status(404).json({ message: "Hospital admin not found" });
    }

    return res.json({ message: "Profile updated", admin });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
