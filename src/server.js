const express = require("express");
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors()); // Allow frontend to access backend

const cloudName = "dqdhnkdzo";
const apiKey = "874566475182871";
const apiSecret = "VybhvygdSiAkTdUlitCWDJ2swl4";

app.get("/get-signature", (req, res) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const signatureString = `timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(signatureString).digest("hex");

  res.json({ timestamp, signature });
});

// 🔹 Listen on PORT 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
