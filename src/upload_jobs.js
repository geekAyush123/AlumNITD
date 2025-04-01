const admin = require("firebase-admin");
const fs = require("fs");

// Initialize Firebase Admin SDK
const serviceAccount = require("./alumnitd-5d90f-firebase-adminsdk-fbsvc-4f18aebc41.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Read JSON file with job data
const jobs = JSON.parse(fs.readFileSync("./dummy_jobs.json", "utf8"));

async function uploadJobs() {
  const batch = db.batch();
  let count = 0;

  for (const job of jobs) {
    // Create a reference to a new document with auto-generated ID
    const jobRef = db.collection("jobs").doc();
    
    // Add the job data to the batch
    batch.set(jobRef, job);
    count++;
    
    console.log(`➕ Added job: ${job.title} at ${job.company}`);
    
    // Firestore batches have a limit of 500 operations
    if (count % 500 === 0) {
      await batch.commit();
      console.log(`🔥 Committed batch of 500 jobs`);
      batch = db.batch(); // Start a new batch
    }
  }

  // Commit any remaining jobs in the batch
  await batch.commit();
  console.log(`✅ Successfully uploaded ${count} jobs to Firestore!`);
}

uploadJobs().catch((error) => {
  console.error("Error uploading jobs:", error);
  process.exit(1);
});