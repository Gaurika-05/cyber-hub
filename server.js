const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const path = require("path");
const cors = require("cors");
const fs = require("fs");

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.static("public"));

// Ensure 'uploads' folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer config: Store files in 'uploads/' with random filename
const upload = multer({ dest: "uploads/" });

// Upload route
app.post("/upload", upload.single("media"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  console.log("File uploaded:", req.file);

  // Rename the file to original filename with timestamp to avoid conflicts
  const uniqueFilename = `${Date.now()}-${req.file.originalname}`;
  const newPath = path.join(uploadDir, uniqueFilename);

  fs.rename(req.file.path, newPath, (renameErr) => {
    if (renameErr) {
      console.error("Rename error:", renameErr);
      return res.status(500).json({ error: "Failed to rename file." });
    }

    // Construct Python command
    const pythonScriptPath = path.join("SERVER", "runModel.py");
    const pythonCommand = `python ${pythonScriptPath} "${newPath}"`;

    // Run the Python script
    exec(pythonCommand, { cwd: __dirname }, (err, stdout, stderr) => {
      if (err || stderr) {
        console.error("Python execution error:", err || stderr);
        return res.status(500).json({ error: "Analysis failed." });
      }

      try {
        const result = JSON.parse(stdout);
        res.json(result);
      } catch (parseErr) {
        console.error("Failed to parse JSON from Python script:", parseErr);
        res.status(500).json({ error: "Invalid result from analysis." });
      }
    });
  });
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
