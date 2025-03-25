const admin = require("firebase-admin");
const fs = require("fs");

// Initialize Firebase Admin SDK
const serviceAccount = require("./alumnitd-5d90f-firebase-adminsdk-fbsvc-4f18aebc41.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Read JSON file
const users = JSON.parse(fs.readFileSync("./firebase_users_final.json", "utf8"));

async function updateData() {
  const batch = db.batch();

  for (const user of users) {
    const email = user.email;

    // Query Firestore to check if user exists
    const userSnapshot = await db.collection("users").where("email", "==", email).limit(1).get();

    if (!userSnapshot.empty) {
      // If user exists, update their document
      userSnapshot.forEach((doc) => {
        const userRef = db.collection("users").doc(doc.id);
        batch.set(userRef, user, { merge: true }); // Merge updates with existing data
        console.log(`✅ Updated: ${email}`);
      });
    } else {
      // If user does not exist, add as a new entry
      const newUserRef = db.collection("users").doc();
      batch.set(newUserRef, user);
      console.log(`➕ Added: ${email}`);
    }
  }

  await batch.commit();
  console.log("🔥 Firestore update complete!");
}

updateData().catch(console.error);
