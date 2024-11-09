// This controller file handles the image upload logic

// Importing necessary modules
const handleImageUpload = (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error("No file uploaded");
      err.status = 400;
      next(err);
      return;
    }

    const imageUrl = req.file.filename;
    res.status(200).json({ message: "Image name included", data: imageUrl });
  } catch (err) {
    console.error("File upload error:", err);
    next(err);
  }
};

module.exports = { handleImageUpload };
