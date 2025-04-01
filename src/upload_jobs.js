const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// 1. Use absolute path to your service account file
const serviceAccount = require(path.join(__dirname, "firebase-adminsdk.json"));

// 2. Initialize Firebase with explicit project ID
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();

// 3. Add error handling for JSON parsing
let jobs = [];
try {
  jobs = JSON.parse(fs.readFileSync(path.join(__dirname, "dummy_jobs.json"), "utf8"));
} catch (err) {
  console.error("Error reading jobs file:", err);
  process.exit(1);
}

// 4. Modified upload function with better error handling
async function uploadJobs() {
  try {
    console.log("Starting job upload...");
    
    // Process jobs in smaller batches
    const batchSize = 10;
    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = db.batch();
      const batchJobs = jobs.slice(i, i + batchSize);
      
      for (const job of batchJobs) {
        const newDocRef = db.collection("jobs").doc();
        batch.set(newDocRef, job);
        console.log(`➕ Prepared: ${job.title} at ${job.company}`);
      }
      
      await batch.commit();
      console.log(`✅ Committed batch ${i/batchSize + 1}`);
    }
    
    console.log("🔥 All jobs uploaded successfully!");
  } catch (error) {
    console.error("Error uploading jobs:", error.message);
    if (error.details) console.error("Details:", error.details);
    process.exit(1);
  }
}

// 5. Run with async error handling
(async () => {
  try {
    await uploadJobs();
  } catch (err) {
    console.error("Fatal error:", err);
  }
})();