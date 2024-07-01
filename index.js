/*
Your Student information in here
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