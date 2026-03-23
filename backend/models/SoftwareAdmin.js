import mongoose from "mongoose";

const softwareAdminSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

softwareAdminSchema.pre("validate", async function setAdminId(next) {
  if (!this.adminId) {
    const count = await mongoose.models.SoftwareAdmin.countDocuments();
    this.adminId = `SA${String(count + 1).padStart(3, "0")}`;
  }
  next();
});

export default mongoose.model("SoftwareAdmin", softwareAdminSchema);
