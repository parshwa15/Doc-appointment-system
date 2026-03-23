import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: String,
      unique: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
    prescription: {
      type: String,
      default: "",
      trim: true,
    },
    paymentMode: {
      type: String,
      default: "Cash",
    },
  },
  { timestamps: true }
);

appointmentSchema.pre("validate", async function setAppointmentId(next) {
  if (!this.appointmentId) {
    const count = await mongoose.models.Appointment.countDocuments();
    this.appointmentId = `APT${String(10001 + count)}`;
  }
  next();
});

export default mongoose.model("Appointment", appointmentSchema);
