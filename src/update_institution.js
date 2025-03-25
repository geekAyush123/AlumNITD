const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
const serviceAccount = require("./alumnitd-5d90f-firebase-adminsdk-fbsvc-4f18aebc41.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const usersRef = db.collection("users");

// Function to update all users' institution field
const updateInstitutions = async () => {
  try {
    const snapshot = await usersRef.get();
    const batch = db.batch();
    const institutionChoices = ["NIT Delhi", "National Institute of Technology Delhi"];

    snapshot.forEach((doc) => {
      const userRef = usersRef.doc(doc.id);
      const randomInstitution = institutionChoices[Math.floor(Math.random() * institutionChoices.length)];
      batch.update(userRef, { "education.institution": randomInstitution });
    });

    await batch.commit();
    console.log("All user institutions updated successfully!");
  } catch (error) {
    console.error("Error updating institutions:", error);
  }
};

updateInstitutions();
