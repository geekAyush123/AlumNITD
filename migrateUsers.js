const admin = require('firebase-admin');
const serviceAccount = require('./alumnitd-5d90f-firebase-adminsdk-fbsvc-51dc4d2d8c.json');

// Initialize Firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore();
const BATCH_SIZE = 500; // Firestore batch limit

async function migrateSkills() {
  console.log('Starting skills standardization...');
  
  try {
    let processedCount = 0;
    let updatedCount = 0;
    let batchCount = 0;
    let batch = db.batch();
    
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    const totalUsers = usersSnapshot.size;
    console.log(`Found ${totalUsers} users to process`);
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      
      // Skip if already in correct string format
      if (typeof userData.skills === 'string') {
        processedCount++;
        continue;
      }
      
      // Prepare the update
      const update = {};
      
      // Convert array to comma-separated string
      if (Array.isArray(userData.skills)) {
        update.skills = userData.skills
          .filter(skill => skill && typeof skill === 'string') // Remove empty/non-string items
          .map(skill => skill.trim()) // Trim whitespace
          .filter(skill => skill.length > 0) // Remove empty strings
          .join(', '); // Join with commas
      } else {
        // Handle cases where skills is not an array (set to empty string)
        update.skills = '';
      }
      
      // Only update if we have changes
      if (Object.keys(update).length > 0) {
        batch.update(doc.ref, update);
        updatedCount++;
        batchCount++;
        
        // Commit batch when we reach the limit
        if (batchCount >= BATCH_SIZE) {
          await batch.commit();
          console.log(`Committed batch of ${batchCount} updates (${processedCount}/${totalUsers} processed, ${updatedCount} updated)`);
          batch = db.batch();
          batchCount = 0;
        }
      }
      
      processedCount++;
    }
    
    // Commit any remaining documents in the batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${batchCount} updates`);
    }
    
    console.log(`\nMigration complete!
    Total users: ${totalUsers}
    Processed: ${processedCount}
    Updated: ${updatedCount}
    Unchanged: ${processedCount - updatedCount}`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateSkills();