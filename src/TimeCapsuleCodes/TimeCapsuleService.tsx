import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { uploadToCloudinary } from './CloudinaryService';

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

const CLOUDINARY_CONFIG = {
  uploadPreset: "timeCapsule",
  cloudName: "dqdhnkdzo"
};

export const createTimeCapsule = async (
  capsuleData: Omit<TimeCapsule, 'id' | 'creatorId' | 'creatorEmail' | 'creationDate' | 'viewedBy' | 'status'>
): Promise<string> => {
  const user = auth().currentUser;
  if (!user) throw new Error('Authentication required');

  try {
    // Upload media in batches (2 at a time)
    let mediaUrls: string[] = [];
    if (capsuleData.mediaUrls?.length) {
      for (let i = 0; i < capsuleData.mediaUrls.length; i += 2) {
        const batch = capsuleData.mediaUrls.slice(i, i + 2);
        const uploaded = await Promise.all(
          batch.map(uri => uploadToCloudinary({
            uri,
            uploadPreset: CLOUDINARY_CONFIG.uploadPreset,
            cloudName: CLOUDINARY_CONFIG.cloudName,
            folder: 'time_capsules',
            resourceType: uri.endsWith('.mp4') ? 'video' : 'image'
          }))
        );
        mediaUrls.push(...uploaded);
      }
    }

    // Resolve recipient IDs
    const recipientIds = capsuleData.recipients?.length 
      ? (await Promise.all(
          capsuleData.recipients.map(async email => {
            const snapshot = await firestore()
              .collection('users')
              .where('email', '==', email.trim())
              .limit(1)
              .get();
            return snapshot.docs[0]?.id;
          })
        )).filter(Boolean) as string[]
      : [];

    // Create Firestore document
    const docRef = await firestore().collection('timeCapsules').add({
      creatorId: user.uid,
      creatorEmail: user.email || '',
      title: capsuleData.title,
      message: capsuleData.message,
      mediaUrls,
      creationDate: firestore.FieldValue.serverTimestamp(),
      unlockDate: capsuleData.unlockDate,
      recipients: recipientIds,
      isPublic: capsuleData.isPublic,
      viewedBy: [],
      status: 'active'
    });

    return docRef.id;
  } catch (error) {
    console.error("Time capsule creation failed:", error);
    throw error;
  }
};

export const getUserTimeCapsules = async (userId: string): Promise<TimeCapsule[]> => {
  try {
    const [created, received] = await Promise.all([
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

    return [...created.docs, ...received.docs]
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        creationDate: doc.data().creationDate?.toDate() || new Date(),
        unlockDate: doc.data().unlockDate?.toDate() || new Date()
      } as TimeCapsule))
      .sort((a, b) => a.unlockDate.getTime() - b.unlockDate.getTime());
  } catch (error) {
    console.error("Failed to fetch capsules:", error);
    return [];
  }
};

export const markCapsuleAsViewed = async (capsuleId: string, userId: string): Promise<boolean> => {
  try {
    await firestore()
      .collection('timeCapsules')
      .doc(capsuleId)
      .update({
        viewedBy: firestore.FieldValue.arrayUnion(userId)
      });
    return true;
  } catch (error) {
    console.error("Failed to mark as viewed:", error);
    return false;
  }
};

export const deleteTimeCapsule = async (capsuleId: string): Promise<boolean> => {
  try {
    await firestore()
      .collection('timeCapsules')
      .doc(capsuleId)
      .update({ status: 'deleted' });
    return true;
  } catch (error) {
    console.error("Failed to delete:", error);
    return false;
  }
};