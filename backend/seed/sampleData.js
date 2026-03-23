import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "../config/db.js";
import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Hospital from "../models/Hospital.js";
import HospitalAdmin from "../models/HospitalAdmin.js";
import Patient from "../models/Patient.js";
import SoftwareAdmin from "../models/SoftwareAdmin.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const seed = async () => {
  try {
    await connectDB();

    await Promise.all([
      SoftwareAdmin.deleteMany(),
      Hospital.deleteMany(),
      HospitalAdmin.deleteMany(),
      Doctor.deleteMany(),
      Patient.deleteMany(),
      Appointment.deleteMany(),
    ]);

    const [softwarePassword, adminPassword, doctorPassword, patientPassword] = await Promise.all([
      bcrypt.hash("admin123", 10),
      bcrypt.hash("hospital123", 10),
      bcrypt.hash("doctor123", 10),
      bcrypt.hash("patient123", 10),
    ]);

    const softwareAdmin = await SoftwareAdmin.create({
      name: "System Admin",
      email: "software@admin.com",
      password: softwarePassword,
      contactNo: "9999999999",
    });

    const hospital = await Hospital.create({
      name: "Sunrise Multi Speciality Hospital",
      address: "MG Road, Bengaluru",
      contactNo: "8888888888",
      description: "General medicine, orthopedics and pediatrics",
    });

    const hospitalAdmin = await HospitalAdmin.create({
      name: "Hospital Manager",
      email: "hospital@admin.com",
      password: adminPassword,
      contactNo: "7777777777",
      hospitalId: hospital._id,
    });

    const doctor = await Doctor.create({
      name: "Dr. Priya Raman",
      email: "doctor@hospital.com",
      password: doctorPassword,
      profession: "Cardiologist",
      experience: 8,
      ratings: 4.5,
      reviewsCount: 2,
      timeSlots: ["09:00 AM", "10:00 AM", "11:30 AM"],
      contactNo: "6666666666",
      age: 39,
      hospitalId: hospital._id,
      paymentModes: ["Cash", "UPI", "Card"],
    });

    const patient = await Patient.create({
      name: "Rahul Verma",
      email: "patient@example.com",
      password: patientPassword,
      contactNo: "5555555555",
      gender: "Male",
      age: 30,
      bloodGroup: "O+",
    });

    await Appointment.create({
      patientId: patient._id,
      doctorId: doctor._id,
      hospitalId: hospital._id,
      date: "2026-03-25",
      timeSlot: "10:00 AM",
      status: "Pending",
      paymentMode: "UPI",
    });

    console.log("Sample data seeded successfully");
    console.log("Software Admin: software@admin.com / admin123");
    console.log("Hospital Admin: hospital@admin.com / hospital123");
    console.log("Doctor: doctor@hospital.com / doctor123");
    console.log("Patient: patient@example.com / patient123");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seed();
