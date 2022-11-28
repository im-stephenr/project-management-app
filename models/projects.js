const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const projectSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true, minLength: 5 },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  github: { type: String },
  url: { type: String },
  images: [{ type: String }],
  date_uploaded: { type: Date, default: Date.now },
});

projectSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Projects", projectSchema);
