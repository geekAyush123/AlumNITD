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
const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  recepientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  messageType: {
    type: String,
    enum: ["text", "image"],
  },
  message: String,
  imageUrl: String,
  timeStamp: {
    type: Date,
    default: Date.now,
  },
});

const Message = mongoose.model('Message',messageSchema);
const userSchema=new mongoose.Schema({
  name:{type:String,required:true},
  email:{type:String,required:true,unique:true},
  password:{type:String,required:true},
  image:{
      type:String,required:true
  },
  userType: String,
  friendRequests:[
      {
          type:mongoose.Schema.Types.ObjectId,
          ref:"User"

  }],
  friends:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"User"
  }],
  sentFriendRequests:[
      {
          type:mongoose.Schema.Types.ObjectId,
          ref:"User"

  }],



})

const User=mongoose.model("User",userSchema)
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
  //function to create a token for the user
  const createToken = (userId) => {
    // Set the token payload
    const payload = {
      userId: userId,
    };
  
    // Generate the token with a secret key and expiration time
    const token = jwt.sign(payload, "Q$r2K6W8n!jCW%Zk", { expiresIn: "1h" });
  
    return token;
  };

  ////////////////endpoint for logging in of that particular user
  app.post("/login", (req, res) => {
    const { email, password, userType } = req.body;
  
    // Validate input
    if (!email || !password || !userType) {
      return res.status(400).json({ message: "Email, password, and user type are required" });
    }
  
    // Find user by email
    User.findOne({ email })
      .then((user) => {
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
  
        // Check password
        if (user.password !== password) {
          return res.status(401).json({ message: "Invalid password" });
        }
  
        // Check userType match
        if (user.userType !== userType) {
          return res.status(403).json({ message: "Incorrect user type" });
        }
  
        // Create token
        const token = createToken(user._id);
        res.status(200).json({ token });
      })
      .catch((error) => {
        console.error("Error finding user:", error);
        res.status(500).json({ message: "Internal server error" });
      });
  });
app.get("/users/:userId", async (req, res) => {
  try {
    const loggedInUserId = req.params.userId;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(loggedInUserId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    // Fetch the logged-in user's document to get their friends
    const loggedInUser = await User.findById(loggedInUserId).select('name email image userType friends').lean(); // Explicitly select 'userType' here

    if (!loggedInUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Combine user's own ID and their friends' IDs into an array to exclude
    const excludedUserIds = [loggedInUserId, ...loggedInUser.friends.map(id => id.toString())];

    // Find users who are not in the excluded list and include 'userType' in the response
    const users = await User.find({
      _id: { $nin: excludedUserIds }
    }).select('name email image userType') // Explicitly select 'userType' here too
      .lean();

    res.status(200).json(users);
  } catch (err) {
    console.error("Error retrieving users:", err);
    res.status(500).json({ message: "Error retrieving users" });
  }
});

/////////endpoint to send a request to user
app.post("/friend-request", async (req, res) => {
  const { currentUserId, selectedUserId } = req.body;

  try {
    //update the recepient's friendRequestsArray!
    await User.findByIdAndUpdate(selectedUserId, {
      $push: { friendRequests: currentUserId },
    });

    //update the sender's sentFriendRequests array
    await User.findByIdAndUpdate(currentUserId, {
      $push: { sentFriendRequests: selectedUserId },
    });

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});
///////endpoint to show all the friend-request of particular user
app.get("/friend-request/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    // Fetch user document and populate friend requests with userType
    const user = await User.findById(userId)
      .populate("friendRequests", "name email image userType") // Include userType here
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure uniqueness using a Set
    const uniqueFriendRequests = Array.from(
      new Map(user.friendRequests.map((req) => [req._id.toString(), req])).values()
    );

    res.json(uniqueFriendRequests);
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

////endpoint to accept a friend request of a particular person
app.post("/friend-request/accept", async (req, res) => {
  try {
    const { senderId, recepientId } = req.body;

    //retrieve the documents of sender and the recipient
    const sender = await User.findById(senderId);
    const recepient = await User.findById(recepientId);

    sender.friends.push(recepientId);
    recepient.friends.push(senderId);

    recepient.friendRequests = recepient.friendRequests.filter(
      (request) => request.toString() !== senderId.toString()
    );

    sender.sentFriendRequests = sender.sentFriendRequests.filter(
      (request) => request.toString() !== recepientId.toString()
    );

    await sender.save();
    await recepient.save();

    res.status(200).json({ message: "Friend Request accepted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

////endpoint to access all the friends of loggedIn users
app.get("/accepted-friends/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid User ID" });
    }

    // Fetch user and populate friends
    const user = await User.findById(userId)
      .populate("friends", "name email image")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure uniqueness using a Set
    const uniqueFriends = Array.from(
      new Map(user.friends.map((friend) => [friend._id.toString(), friend])).values()
    );

    res.json(uniqueFriends);
  } catch (error) {
    console.error("Error fetching accepted friends:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});



// Configure multer for handling file uploads


////endpoint to post messages and store it in the backend
app.post("/messages", upload.single('imageFile'), async (req, res) => {
  try {
      const { senderId, recepientId, messageType, messageText } = req.body;
      let newMessage;

      if (messageType === "image") {
          const imageFile = req.file;
          let imageUrl = "";

          if (imageFile) {
              const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                  resource_type: "image",
              });
              imageUrl = imageUpload.secure_url;
          }

          newMessage = new Message({
              senderId,
              recepientId,
              messageType,
              message: messageText,
              timestamp: new Date(),
              imageUrl: imageUrl || null,
          });

      } else {
          // ✅ Handles other message types like text
          newMessage = new Message({
              senderId,
              recepientId,
              messageType,
              message: messageText,
              timestamp: new Date(),
              imageUrl: null,
          });
      }

      await newMessage.save();
      res.status(200).json({ message: "Message sent Successfully" });

  } catch (error) {
      console.error("Error in /messages:", error);
      res.status(500).json({ error: "Internal Server Error" });
  }
});


//endpoint to get the userdetails to design the header part of chatroom
app.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    //fetch the user data from the user ID
    const recepientId = await User.findById(userId);

    res.json(recepientId);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//endpoint to fetch the messages between two users in the chatRoom
app.get("/messages/:senderId/:recepientId", async (req, res) => {
  try {
    const { senderId, recepientId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, recepientId: recepientId },
        { senderId: recepientId, recepientId: senderId },
      ],
    }).populate("senderId", "_id name");

    res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//endpoint to delete the message
app.post("/deleteMessages", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "invalid req body!" });
    }

    await Message.deleteMany({ _id: { $in: messages } });

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server" });
  }
});
app.get("/friend-requests/sent/:userId",async(req,res) => {
  try{
    const {userId} = req.params;
    const user = await User.findById(userId).populate("sentFriendRequests","name email image").lean();

    const sentFriendRequests = user.sentFriendRequests;

    res.json(sentFriendRequests);
  } catch(error){
    console.log("error",error);
    res.status(500).json({ error: "Internal Server" });
  }
})
app.get("/friends/:userId",(req,res) => {
  try{
    const {userId} = req.params;

    User.findById(userId).populate("friends").then((user) => {
      if(!user){
        return res.status(404).json({message: "User not found"})
      }

      const friendIds = user.friends.map((friend) => friend._id);

      res.status(200).json(friendIds);
    })
  } catch(error){
    console.log("error",error);
    res.status(500).json({message:"internal server error"})
  }
})


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
