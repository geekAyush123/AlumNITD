const admin = require('firebase-admin');
const serviceAccount = require('./alumnitd-5d90f-firebase-adminsdk-fbsvc-51dc4d2d8c.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function normalizeUserSchemas() {
  try {
    const usersCollection = db.collection('users');
    const snapshot = await usersCollection.get();
    
    let batch = db.batch();
    let batchCount = 0;
    const BATCH_LIMIT = 500; // Firestore batch limit
    
    for (const doc of snapshot.docs) {
      const userData = doc.data();
      const normalizedData = {};
      
      // Normalize bio field
      normalizedData.bio = userData.bio || "";
      
      // Normalize company field (if exists at root)
      normalizedData.company = userData.company || "";
      
      // Normalize degree field (if exists at root)
      normalizedData.degree = userData.degree || "";
      
      // Normalize education field
      if (userData.education) {
        normalizedData.education = {
          degree: userData.education.degree || "",
          fieldOfStudy: userData.education.fieldOfStudy || "",
          graduationYear: userData.education.graduationYear 
            ? String(userData.education.graduationYear) 
            : "",
          institution: userData.education.institution || "",
          endDate: userData.education.endDate || ""
        };
      } else {
        normalizedData.education = {
          degree: "",
          fieldOfStudy: "",
          graduationYear: "",
          institution: "",
          endDate: ""
        };
      }
      
      // Normalize email field
      normalizedData.email = userData.email || "";
      
      // Normalize experience field (handle both 'experience' and 'workExperience')
      const experienceData = userData.experience || userData.workExperience || {};
      normalizedData.experience = {
        company: experienceData.company || "",
        description: experienceData.jobDescription || experienceData.description || "",
        endDate: experienceData.endDate || "",
        jobTitle: experienceData.jobTitle || "",
        startDate: experienceData.startDate || ""
      };
      
      // Normalize other fields
      normalizedData.fieldOfStudy = userData.fieldOfStudy || "";
      normalizedData.fullName = userData.fullName || "";
      normalizedData.githubUrl = userData.githubUrl || "";
      normalizedData.graduationYear = userData.graduationYear 
        ? String(userData.graduationYear) 
        : "";
      normalizedData.institution = userData.institution || "";
      normalizedData.jobDescription = userData.jobDescription || "";
      normalizedData.jobTitle = userData.jobTitle || "";
      normalizedData.linkedinUrl = userData.linkedinUrl || "";
      normalizedData.location = userData.location || "";
      normalizedData.phone = userData.phone || "";
      normalizedData.profilePic = userData.profilePic || "";
      normalizedData.role = userData.role || "";
      normalizedData.skills = userData.skills || "";
      normalizedData.startDate = userData.startDate || "";
      normalizedData.updatedAt = admin.firestore.FieldValue.serverTimestamp();
      
      // Update the document with normalized data
      batch.update(doc.ref, normalizedData);
      batchCount++;
      
      // Commit batch if we reach the limit
      if (batchCount >= BATCH_LIMIT) {
        await batch.commit();
        batch = db.batch();
        batchCount = 0;
      }
    }
    
    // Commit any remaining documents in the batch
    if (batchCount > 0) {
      await batch.commit();
    }
    
    console.log('All user schemas have been normalized successfully!');
  } catch (error) {
    console.error('Error normalizing user schemas:', error);
  }
}

normalizeUserSchemas();