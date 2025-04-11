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

// 🌐 MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/donation")
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));


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
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
}, { timestamps: true });

const Blog = mongoose.model('Blog',blogSchema);

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
///addedd discussion
app.get('/blogs', async (req, res) => {
  console.log("hello")
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
  
});

// POST create a new blog
app.post('/blogs', async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content are required' });

  try {
    const newBlog = new Blog({ title, content });
    await newBlog.save();
    res.status(201).json(newBlog);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create blog' });
  }
});

// PUT update a blog
app.put('/blogs/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const updated = await Blog.findByIdAndUpdate(
      id,
      { title, content },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Blog not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update blog' });
  }
});

// DELETE a blog
app.delete('/blogs/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Blog.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Blog not found' });
    res.json({ message: 'Blog deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});
//search the blog
app.get('/search',async (req,res)=>{
  try {
      const { title } = req.query;
  
      if (!title) {
        return res.status(400).json({ error: 'Title query param is required' });
      }
  
      // Case-insensitive partial match using RegExp
      const blogs = await Blog.find({
        title: { $regex: title, $options: 'i' },
      });
  
      res.json(blogs);
    } catch (err) {
      console.error('Search error:', err);
      res.status(500).json({ error: 'Server error while searching blogs' });
    }
})

// 🟢 Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
