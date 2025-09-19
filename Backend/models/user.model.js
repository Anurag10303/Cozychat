import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  confirmPassword: {
    type: String,
  },
  avatar:   { type: String },
},{timestamps: true}); //timestamps creates createdAt and updatedAt fields automatically

const User = mongoose.model("User", userSchema);

export default User;
