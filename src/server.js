const express = require("express");
const crypto = require("crypto");
const cors = require("cors");
const mongoose=require("mongoose")
const cloudinaryV2 = require("cloudinary").v2;
const multer=require("multer")
const app = express();
app.use(cors()); // Allow frontend to access backend
app.use(express.json())

cloudinaryV2.config({
  cloud_name: "dzcwki4mp",
  api_key: "596478687471453",
  api_secret: "jXjyF2Yqa4SACaD7ZsnCgl9JbZg",
});
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
const Donation=mongoose.model("Donation",donationSchema)

app.get("/get-signature", (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const signatureString = `timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(signatureString).digest("hex");

  res.json({ timestamp, signature });
});
// app.use("/api/donations", donationRoutes);
// Multer config for temporary file storage
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `screenshot-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit
mongoose
  .connect("mongodb://localhost:27017/donation")
  .then(() => {
    console.log("✅ MongoDB connected");
  })
  .catch((err) => console.error("❌ Mongo error:", err));

// Route for donations - NO router
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

    // Save to DB
    const donation = await Donation.create({
      transactionId,
      screenshotPath: result.secure_url,
    });

    res.status(201).json({ message: "Donation saved", donation });
  } catch (err) {
    console.error("Error saving donation:", err);
    res.status(500).json({ error: "Server error", details: err });
  }
});


// 🔹 Listen on PORT 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
