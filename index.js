/*
Name: Tirth Patel
Number: N01598044
*/

require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require("path");
const fs = require("fs");
const multer = require("multer");

// Middleware
app.use(express.urlencoded({ extended: true })); // Handle normal forms -> url encoded
app.use(express.json()); // Handle raw JSON data

// Check and create upload directory
const uploadDir = path.join(__dirname, 'upload');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up storage for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Serve static files from the views directory
app.use(express.static(path.join(__dirname, "views")));

// Root route
app.get('/', (req, res) => {
  res.send('Welcome');
});

// Single file upload route
app.route("/upload")
  .get((req, res) => {
    res.sendFile(path.join(__dirname, "views", "upload.html"));
  })
  .post(upload.single("file"), (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    res.send(`File uploaded successfully: ${req.file.path}`);
  });

// Multiple file upload route
app.route("/upload-multiple")
  .get((req, res) => {
    res.sendFile(path.join(__dirname, "views", "upload-multiple.html"));
  })
  .post(upload.array("files", 15), (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("No files uploaded.");
    }
    const filePaths = req.files.map((file) => file.path);
    res.status(200).send(`Files uploaded successfully: ${filePaths.join(", ")}`);
  });

// Fetch single random file route
app.get("/fetch-single", (req, res) => {
  const uploads = fs.readdirSync(uploadDir);

  // Log the list of all images
  console.log("All images:", uploads);

  // Add error handling
  if (uploads.length === 0) {
    return res.status(503).send({ message: "No images" });
  }

  const randomIndex = Math.floor(Math.random() * uploads.length);
  const randomImage = uploads[randomIndex];

  // Log the randomly selected image
  console.log("Randomly selected image:", randomImage);

  res.sendFile(path.join(uploadDir, randomImage));
});

// Fetch all images route
app.get("/fetch-all-images", (req, res) => {
  const files = fs.readdirSync(uploadDir);
  const fileContents = files.map((file) => ({
    name: file,
    content: fs.readFileSync(path.join(uploadDir, file), "base64")
  }));

  res.json(fileContents);
});

// Serve gallery.html
app.get("/gallery", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "gallery.html"));
});

// Fetch all files with pagination
app.get("/fetch-all/pages/:index", (req, res) => {
  const ITEMS_PER_PAGE = parseInt(req.query.items_per_page, 10) || 3;
  const pageIndex = parseInt(req.params.index, 10);

  if (isNaN(pageIndex) || pageIndex < 1) {
    return res.status(400).send("Invalid page index.");
  }

  const allFiles = getAllFiles();
  const totalItems = allFiles.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  if (pageIndex > totalPages) {
    return res.status(404).send("Page not found.");
  }

  const startIndex = (pageIndex - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const pageItems = allFiles.slice(startIndex, endIndex);

  res.json({
    page: pageIndex,
    totalPages: totalPages,
    files: pageItems,
  });
});

// Fetch total number of images route
app.get("/total-images", (req, res) => {
  const allFiles = getAllFiles();
  res.json({ total: allFiles.length });
});

// Fetch random images route
app.get("/fetch-random-images", (req, res) => {
  const numImages = parseInt(req.query.num, 10);

  if (isNaN(numImages) || numImages < 1) {
    return res.status(400).send("Invalid number of images.");
  }

  const allFiles = getAllFiles();
  const shuffledFiles = allFiles.sort(() => 0.5 - Math.random());
  const selectedFiles = shuffledFiles.slice(0, Math.min(numImages, allFiles.length));

  res.json(selectedFiles);
});

const getAllFiles = () => {
  const files = fs.readdirSync(uploadDir);
  return files.map((file) => ({
    name: file,
    content: fs.readFileSync(path.join(uploadDir, file), "base64")
  }));
};

// Serve gallery-pagination.html
app.get("/gallery-pagination", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "gallery-pagination.html"));
});

// Serve random-gallery.html
app.get("/random-gallery", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "random-gallery.html"));
});

// Catch all other requests
app.use((req, res) => {
  res.status(404).send("Route not found");
});

// Start the server
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
