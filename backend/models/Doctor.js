import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    doctorId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    profession: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: Number,
      default: 0,
    },
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    timeSlots: {
      type: [String],
      default: [],
    },
    contactNo: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      required: true,
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
    paymentModes: {
      type: [String],
      default: ["Cash"],
    },
  },
  { timestamps: true }
);

doctorSchema.pre("validate", async function setDoctorId(next) {
  if (!this.doctorId) {
    const count = await mongoose.models.Doctor.countDocuments();
    this.doctorId = `DR${String(101 + count)}`;
  }
  next();
});

export default mongoose.model("Doctor", doctorSchema);
