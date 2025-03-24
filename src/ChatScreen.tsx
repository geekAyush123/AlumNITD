import React, { useEffect, useState } from 'react';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { RouteProp } from '@react-navigation/native';

// Define the types for your navigation stack
type RootStackParamList = {
  Chat: { conversationId: string };
};

// Define the route prop type for this screen
interface ChatScreenProps {
  route: RouteProp<RootStackParamList, 'Chat'>;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ route }) => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const { conversationId } = route.params;
  const user = auth().currentUser;

  useEffect(() => {
    const messagesRef = firestore()
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .orderBy('createdAt', 'desc');

    const unsubscribe = messagesRef.onSnapshot(snapshot => {
      const messagesList = snapshot.docs.map(doc => ({
        _id: doc.id,
        text: doc.data().text,
        createdAt: doc.data().createdAt.toDate(),
        user: {
          _id: doc.data().user._id,
          name: doc.data().user.name,
        },
      }));
      setMessages(messagesList);
    });

    return () => unsubscribe();
  }, [conversationId]);

  const onSend = (newMessages: IMessage[] = []) => {
    const message = newMessages[0];
    firestore()
      .collection('conversations')
      .doc(conversationId)
      .collection('messages')
      .add({
        ...message,
        createdAt: firestore.FieldValue.serverTimestamp(),
        user: {
          _id: user?.uid || '',
          name: user?.displayName || '',
        },
      });
  };

  return (
    <GiftedChat
      messages={messages}
      onSend={newMessages => onSend(newMessages)}
      user={{
        _id: user?.uid || '',
        name: user?.displayName || '',
      }}
    />
  );
};

export default ChatScreen;