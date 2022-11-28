const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, minLength: 6 },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  image: { type: String, required: true },
  projects: [
    { type: mongoose.Types.ObjectId, required: true, ref: "Projects" },
  ],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", userSchema);
