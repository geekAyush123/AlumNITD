import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { uploadToCloudinary } from './CloudinaryService';

// Cloudinary configuration
const CLOUDINARY_CONFIG = {
  uploadPreset: "Profile",
  cloudName: "dqdhnkdzo"
};

interface TimeCapsule {
  id?: string;
  creatorId: string;
  creatorEmail: string;
  title: string;
  message: string;
  mediaUrls: string[];
  creationDate: Date;
  unlockDate: Date;
  recipients: string[];
  isPublic: boolean;
  viewedBy: string[];
  status: 'active' | 'deleted';
}

export const createTimeCapsule = async (
  capsuleData: Omit<TimeCapsule, 'id' | 'creatorId' | 'creatorEmail' | 'creationDate' | 'viewedBy' | 'status'>
) => {
  try {
    const user = auth().currentUser;
    if (!user) throw new Error('User not authenticated');

    // Handle media upload to Cloudinary
    let mediaUrls: string[] = [];
    if (capsuleData.mediaUrls?.length > 0) {
      mediaUrls = await Promise.all(
        capsuleData.mediaUrls.map(async (uri) => {
          return await uploadToCloudinary(
            uri,
            CLOUDINARY_CONFIG.uploadPreset,
            CLOUDINARY_CONFIG.cloudName
          );
        })
      );
    }

    // Prepare recipients
    let recipientIds: string[] = [];
    if (capsuleData.recipients?.length > 0) {
      const recipientPromises = capsuleData.recipients.map(async (email) => {
        const snapshot = await firestore()
          .collection('users')
          .where('email', '==', email.trim())
          .limit(1)
          .get();
        return snapshot.docs[0]?.id;
      });
      recipientIds = (await Promise.all(recipientPromises)).filter(Boolean) as string[];
    }

    // Create time capsule document
    const docRef = await firestore().collection('timeCapsules').add({
      creatorId: user.uid,
      creatorEmail: user.email || '',
      title: capsuleData.title,
      message: capsuleData.message,
      mediaUrls,
      creationDate: firestore.FieldValue.serverTimestamp(),
      unlockDate: capsuleData.unlockDate,
      recipients: recipientIds,
      isPublic: capsuleData.isPublic || false,
      viewedBy: [],
      status: 'active'
    });

    return docRef.id;
  } catch (error) {
    console.error("Error creating time capsule:", error);
    throw error;
  }
};

export const getUserTimeCapsules = async (userId: string) => {
  try {
    const [creatorSnap, recipientSnap] = await Promise.all([
      firestore()
        .collection('timeCapsules')
        .where('creatorId', '==', userId)
        .where('status', '==', 'active')
        .get(),
      firestore()
        .collection('timeCapsules')
        .where('recipients', 'array-contains', userId)
        .where('status', '==', 'active')
        .get()
    ]);

    const capsules = [...creatorSnap.docs, ...recipientSnap.docs]
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        creationDate: doc.data().creationDate?.toDate() || new Date(),
        unlockDate: doc.data().unlockDate?.toDate() || new Date()
      } as TimeCapsule));

    return capsules.sort((a, b) => a.unlockDate.getTime() - b.unlockDate.getTime());
  } catch (error) {
    console.error("Error getting time capsules:", error);
    return [];
  }
};

export const markCapsuleAsViewed = async (capsuleId: string, userId: string) => {
  try {
    await firestore()
      .collection('timeCapsules')
      .doc(capsuleId)
      .update({
        viewedBy: firestore.FieldValue.arrayUnion(userId)
      });
    return true;
  } catch (error) {
    console.error("Error marking capsule as viewed:", error);
    return false;
  }
};

export const deleteTimeCapsule = async (capsuleId: string) => {
  try {
    await firestore()
      .collection('timeCapsules')
      .doc(capsuleId)
      .update({ status: 'deleted' });
    return true;
  } catch (error) {
    console.error("Error deleting time capsule:", error);
    return false;
  }
};