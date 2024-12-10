// This route uploads the image into the shirtImg directory

// Importing necessary modules
const express = require("express");
const multer = require("multer");
const path = require("path");
const imageUploadRouter = express.Router();
const generateId = require("../../misc/generateId");
const {
  handleImageUpload,
} = require("../../controllers/employeeControllers/employeeImageUploadController");

// Configure multer storage for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set destination folder for uploaded images
    cb(
      null,
      path.join(__dirname, "../../public/shirtImg/")
    );
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = generateId("") + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const uploadConfig = multer({ storage });

// Define the POST route to handle image uploads
imageUploadRouter.post("/", uploadConfig.single("image"), handleImageUpload);

module.exports = imageUploadRouter;
