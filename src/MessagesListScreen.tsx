import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Define the types for your navigation stack
type RootStackParamList = {
  Chat: { conversationId: string };
};

// Define the navigation prop type for this screen
type MessagesListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Chat'>;

interface Conversation {
  id: string;
  participants: string[];
  lastMessage: string;
}

const MessagesListScreen: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const navigation = useNavigation<MessagesListScreenNavigationProp>();
  const user = auth().currentUser;

  useEffect(() => {
    const fetchConversations = async () => {
      if (user) {
        const conversationsRef = firestore()
          .collection('conversations')
          .where('participants', 'array-contains', user.uid);
        const snapshot = await conversationsRef.get();
        const conversationsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Conversation));
        setConversations(conversationsList);
      }
    };
    fetchConversations();
  }, [user]);

  const renderItem = ({ item }: { item: Conversation }) => (
    <TouchableOpacity
      style={styles.conversationItem}
      onPress={() => navigation.navigate('Chat', { conversationId: item.id })}
    >
      <Text style={styles.conversationName}>{item.participants.join(', ')}</Text>
      <Text style={styles.lastMessage}>{item.lastMessage}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  conversationItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  conversationName: { fontSize: 16, fontWeight: 'bold' },
  lastMessage: { fontSize: 14, color: 'gray' },
});

export default MessagesListScreen;