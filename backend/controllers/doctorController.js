import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";

const createToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken({
      id: doctor._id,
      role: "doctor",
      hospitalId: doctor.hospitalId,
    });

    return res.json({ message: "Login successful", token, doctor });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ doctorId: req.user.id })
      .populate("patientId", "name patientId contactNo age bloodGroup")
      .sort({ createdAt: -1 });

    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateDoctorAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, doctorId: req.user.id },
      { status },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    return res.json({ message: "Appointment status updated", appointment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addPrescription = async (req, res) => {
  try {
    const { appointmentId, prescription, paymentMode } = req.body;

    const appointment = await Appointment.findOneAndUpdate(
      { _id: appointmentId, doctorId: req.user.id },
      { prescription, paymentMode },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    return res.json({ message: "Prescription added", appointment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addTimeSlot = async (req, res) => {
  try {
    const { timeSlot } = req.body;
    const doctor = await Doctor.findById(req.user.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if (!doctor.timeSlots.includes(timeSlot)) {
      doctor.timeSlots.push(timeSlot);
    }

    await doctor.save();

    return res.json({ message: "Time slot added", doctor });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
