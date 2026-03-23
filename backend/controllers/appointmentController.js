import Appointment from "../models/Appointment.js";

export const getAllAppointments = async (_req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("doctorId", "name doctorId")
      .populate("patientId", "name patientId")
      .populate("hospitalId", "name")
      .sort({ createdAt: -1 });

    return res.json(appointments);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
