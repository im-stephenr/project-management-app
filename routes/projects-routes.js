const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const projectsController = require("../controllers/projects-controller");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

/** ROUTE STARTS WITH api/projects */

// check auth token in request headers
router.use(checkAuth);

// get all projects
router.get("/", projectsController.getProjects);

// get all projects by userId
router.get("/user/:uid", projectsController.getProjectsByUserId);

// get specific project
router.get("/:pid", projectsController.getProjectsById);

// add project
router.post(
  "/",
  fileUpload.any("files"),
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  projectsController.addProject
);

// update project
router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  projectsController.updateProject
);

router.delete("/:pid", projectsController.deleteProject);

module.exports = router;
