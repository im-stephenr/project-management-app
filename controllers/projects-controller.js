const { validationResult } = require("express-validator");
const { default: mongoose } = require("mongoose");
const HttpError = require("../models/http-error");
const Project = require("../models/projects");
const User = require("../models/users");
const jwt = require("jsonwebtoken");
const users = require("../models/users");
const { startSession } = require("../models/projects");
const fs = require("fs");

const addProject = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Errors Creating Project", errors);
    return next(new HttpError("Invalid inputs failed!", 422));
  }
  let uploadedFiles = [];

  // if there's a file uploaded
  if (req.files) {
    for (const file of req.files) {
      uploadedFiles.push(file.path);
    }
  }

  // Create the project
  const newProject = new Project({
    ...req.body,
    creator: req.userData.userId,
    images: uploadedFiles,
  });

  const user = await User.findById(req.userData.userId);

  if (!user) {
    return next(new HttpError("User not found!", 404));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await newProject.save({ session: sess });
    user.projects.push(newProject);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Creating Place Failed!", 500));
  }

  res.json(newProject);
};

const updateProject = async (req, res, next) => {
  console.log("BACKEND TRIGGERED");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("Errors Creating Project", errors);
    return next(new HttpError("Invalid inputs failed!", 422));
  }
  const { pid } = req.params;

  const user = await User.findById(req.userData.userId);
  if (!user) {
    return next(new HttpError("User not found!", 500));
  }

  try {
    const update = await Project.findByIdAndUpdate(pid, req.body);
    res.json(update);
  } catch (err) {
    console.log(err);
    return next(new HttpError("Updating Place Failed!", 500));
  }
};

const getProjects = async (req, res, next) => {
  try {
    const projectList = await Project.find({}).populate(
      "creator",
      "fullName image"
    );
    res.json({ projects: projectList });
  } catch (err) {
    console.log("GET PROJECTS FAILED: ", err);
    return next(new HttpError("PROJECTS not found!", 404));
  }
};

const getProjectsByUserId = async (req, res, next) => {
  try {
    const projectList = await Project.find({
      creator: req.params.uid,
    }).populate("creator", "fullName image");

    res.json({ projects: projectList });
  } catch (err) {
    console.log("GET PROJECTS FAILED: ", err);
    return next(new HttpError("PROJECTS not found!", 404));
  }
};

const getProjectsById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.pid);
    res.json(project);
  } catch (err) {
    console.log("CANNOT GET PROJECT");
    return next(new HttpError("PROJECT not found!", 404));
  }
};

const deleteProject = async (req, res, next) => {
  let project;
  // check if project exist
  try {
    project = await Project.findById(req.params.pid).populate("creator");
  } catch (err) {
    console.log(err);
    return next(new HttpError("Could not find project!", 500));
  }

  if (project.creator.id != req.userData.userId) {
    return next(
      new HttpError("You are not allowed to delete this project!", 404)
    );
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await project.remove({ session: sess });
    project.creator.projects.pull(project);
    await project.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(new HttpError("Could not delete project!", 500));
  }

  for (let i = 0; i < project.images.length; i++) {
    fs.unlink(project.images[i], (err) => {
      console.log(err);
    });
  }

  res.status(200).json({ message: "Project Deleted Successfully!" });
};

exports.addProject = addProject;
exports.getProjects = getProjects;
exports.getProjectsById = getProjectsById;
exports.updateProject = updateProject;
exports.deleteProject = deleteProject;
exports.getProjectsByUserId = getProjectsByUserId;
