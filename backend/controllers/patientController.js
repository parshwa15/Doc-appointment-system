import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";

const createToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

export const registerPatient = async (req, res) => {
  try {
    const { name, email, password, contactNo, gender, age, bloodGroup } = req.body;

    const existing = await Patient.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const patient = await Patient.create({
      name,
      email,
      password: hashedPassword,
      contactNo,
      gender,
      age,
      bloodGroup,
      profilePhoto: req.file?.path || "",
    });

    return res.status(201).json({ message: "Patient registered", patient });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;

    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, patient.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = createToken({
      id: patient._id,
      role: "patient",
      hospitalId: null,
    });

    return res.json({ message: "Login successful", token, patient });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getDoctors = async (req, res) => {
  try {
    const { search = "", minRating = 0 } = req.query;

    const query = {
      profession: { $regex: search, $options: "i" },
      ratings: { $gte: Number(minRating) || 0 },
    };

    const doctors = await Doctor.find(query)
      .select("-password")
      .populate("hospitalId", "name address")
      .sort({ ratings: -1 });

    return res.json(doctors);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const bookAppointmentByPatient = async (req, res) => {
  try {
    const { doctorId, hospitalId, date, timeSlot, paymentMode } = req.body;

    const appointment = await Appointment.create({
      patientId: req.user.id,
      doctorId,
      hospitalId,
      date,
      timeSlot,
      paymentMode: paymentMode || "Cash",
    });

    return res.status(201).json({ message: "Appointment booked", appointment });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addReview = async (req, res) => {
  try {
    const { doctorId, rating, comment } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const patient = await Patient.findById(req.user.id);
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    patient.reviews.push({ doctorId, rating, comment });
    await patient.save();

    const totalRating = doctor.ratings * doctor.reviewsCount + Number(rating);
    doctor.reviewsCount += 1;
    doctor.ratings = Number((totalRating / doctor.reviewsCount).toFixed(1));
    await doctor.save();

    return res.json({ message: "Review submitted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user.id })
      .populate("doctorId", "name doctorId profession")
      .populate("hospitalId", "name")
      .sort({ createdAt: -1 });

    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
