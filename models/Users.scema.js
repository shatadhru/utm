const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  clerkId: { type: String, required: true },
  role: { type: String, enum: ["admin","instructor","student"], default: "student" },
  CoursesIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
});
const User = mongoose.model("User", UserSchema)

module.exports = User

