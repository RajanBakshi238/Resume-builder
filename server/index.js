const multer = require("multer");
const path = require("path");

const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 4004;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app.use("/uploads", express.static("uploads")); // used to serve the contents of an uploads folder.

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
});

app.get("/api", (req, res) => {
  res.json({
    message: "Hello World",
  });
});

app.post("/resume/create", upload.single("headshotImage"), async (req, res) => {
  const {
    fullName,
    currentPosition,
    currentLength,
    currentTechnologies,
    workHistory,
  } = req.body;

  console.log(req.body);

  res.json({
    message: "Request successful!",
    data: {},
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
