import mongoose from "mongoose";

const hospitalAdminSchema = new mongoose.Schema(
  {
    adminId: {
      type: String,
      unique: true,
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
    profilePhoto: {
      type: String,
      default: "",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    contactNo: {
      type: String,
      required: true,
      trim: true,
    },
    hospitalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hospital",
      required: true,
    },
  },
  { timestamps: true }
);

hospitalAdminSchema.pre("validate", async function setAdminId(next) {
  if (!this.adminId) {
    const count = await mongoose.models.HospitalAdmin.countDocuments();
    this.adminId = `HA${String(count + 1).padStart(3, "0")}`;
  }
  next();
});

export default mongoose.model("HospitalAdmin", hospitalAdminSchema);
