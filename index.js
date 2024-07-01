/*
Name: Tirth Patel
Number: n01598044
*/
require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require("path")
const fs = require("fs")


// middleware:
app.use(express.urlencoded({ extended: true })); // handle normal forms -> url encoded
app.use(express.json()); // Handle raw json data


// catch all other requests
app.use((req, res) => {
res.status(404).send("Route not found");
});
app.listen(PORT, () => {
console.log(`http://localhost:${PORT}`);
});

const multer = require("multer");
const storage = multer.diskStorage({
destination: function (req, file, cb) {
cb(null, "./uploads");
},
filename: function (req, file, cb) {
cb(null, `${Date.now()}-${file.originalname}`);
},
});
const upload = multer({ storage: storage });


app
.route("/upload")
.get((req, res) => {
res.sendFile (path.join(__dirname, "views", "upload.html"));
})
.post(upload.single("file"), (req, res) => {
if (!req.file) {
return res.status(400).send("No file uploaded.");
}
res.send(`File uploaded successfully: ${req.file.path}`);
});


app
.route("/upload-multiple")
.get((req, res) => {
res.sendFile(path.join(__dirname, "views", "upload-multiple.html"));
})
.post(upload.array("files", 100), (req, res) => {
if (!req.files || req.files.length === 0) {
return res.status(400).send("No files uploaded.");
}
const filePaths = req.files.map((file) => file.path);
res
.status(200)
.send(`Files uploaded successfully: ${filePaths.join(", ")}`);
});