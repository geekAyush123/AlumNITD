const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const mongoose = require("mongoose");
const cloudinaryV2 = require("cloudinary").v2;
const multer = require("multer");
const path = require("path"); // ✅ FIX: This was missing earlier
const fs = require("fs"); // Optional: To remove uploaded file after cloud upload

const app = express();
app.use(cors());
app.use(express.json());

// 🌥️ Cloudinary Config
cloudinaryV2.config({
  cloud_name: "dzcwki4mp",
  api_key: "596478687471453",
  api_secret: "jXjyF2Yqa4SACaD7ZsnCgl9JbZg",
});
const apiSecret = "jXjyF2Yqa4SACaD7ZsnCgl9JbZg";

// 🧾 Mongoose Schema
const donationSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  screenshotPath: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Donation = mongoose.model("Donation", donationSchema);

// 🔐 Route to get Cloudinary signature (optional for secure frontend uploads)
app.get("/get-signature", (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const signatureString = `timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(signatureString).digest("hex");

  res.json({ timestamp, signature });
});

// 📦 Multer config
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `screenshot-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

// 🌐 MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/donation")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// 🎯 POST route to accept donations (no router)
app.post("/api/donations", upload.single("screenshot"), async (req, res) => {
  try {
    const { transactionId } = req.body;
    const filePath = req.file?.path;

    if (!transactionId || !filePath) {
      return res.status(400).json({ message: "Missing transaction ID or screenshot" });
    }

    // Upload to Cloudinary
    const result = await cloudinaryV2.uploader.upload(filePath, {
      folder: "donations",
    });

    // Optional: delete local file after upload
    fs.unlink(filePath, (err) => {
      if (err) console.warn("Could not delete temp file:", err);
    });

    // Save to MongoDB
    const donation = await Donation.create({
      transactionId,
      screenshotPath: result.secure_url,
    });

    res.status(201).json({ message: "Donation saved", donation });
  } catch (err) {
    console.error("❌ Error saving donation:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// 🟢 Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
