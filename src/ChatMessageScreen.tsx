import {
    StyleSheet, Text, View, ScrollView, KeyboardAvoidingView,
    TextInput, Pressable, Image
  } from 'react-native';
  import React, {
    useContext, useEffect, useLayoutEffect, useRef, useState
  } from 'react';
  import Entypo from '@expo/vector-icons/Entypo';
  import Feather from '@expo/vector-icons/Feather';
  import EmojiSelector from 'react-native-emoji-selector';
  import { UserType } from '../UserContext';
  import Ionicons from '@expo/vector-icons/Ionicons';
  import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
  import * as ImagePicker from "expo-image-picker";
  import FontAwesome from '@expo/vector-icons/FontAwesome';
  import MaterialIcons from '@expo/vector-icons/MaterialIcons';
  
  type Message = {
    _id: string;
    senderId: { _id: string };
    message: string;
    messageType: 'text' | 'image';
    imageUrl?: string;
    timeStamp: string;
  };
  
  type RecipientData = {
    name?: string;
    image?: string;
  };
  
  type RouteParams = {
    recepientId: string;
  };
  
  const ChatMessageScreen: React.FC = () => {
    const [showEmojiSelector, setShowEmojiSelector] = useState<boolean>(false);
    const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [recepientData, setRecepientData] = useState<RecipientData>({});
  
    const { userId } = useContext(UserType);
    const navigation = useNavigation();
    const route = useRoute<RouteProp<Record<string, RouteParams>, string>>();
    const { recepientId } = route.params;
  
    const scrollViewRef = useRef<ScrollView>(null);
  
    const scrollToBottom = () => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    };
  
    useEffect(() => {
      scrollToBottom();
    }, [messages]);
  
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://172.20.10.6:8000/messages/${userId}/${recepientId}`);
        const data = await response.json();
        if (response.ok) setMessages(data);
        else console.log("error showing messages", response.status);
      } catch (error) {
        console.log("error fetching messages", error);
      }
    };
  
    const fetchRecepientData = async () => {
      try {
        const response = await fetch(`http://172.20.10.6:8000/user/${recepientId}`);
        const data = await response.json();
        setRecepientData(data);
      } catch (error) {
        console.log("error retrieving details", error);
      }
    };
  
    useEffect(() => {
      fetchMessages();
      fetchRecepientData();
    }, []);
  
    const handleSend = async (messageType: 'text' | 'image', imageUri: string = '') => {
      try {
        const formData = new FormData();
        formData.append("senderId", userId);
        formData.append("recepientId", recepientId);
        formData.append("messageType", messageType);
  
        if (messageType === "image") {
          formData.append("imageFile", {
            uri: imageUri,
            name: "photo.jpg",
            type: "image/jpeg",
          } as any);
        } else {
          formData.append("messageText", message);
        }
  
        const response = await fetch("http://172.20.10.6:8000/messages", {
          method: "POST",
          headers: { "Content-Type": "multipart/form-data" },
          body: formData
        });
  
        if (response.ok) {
          setMessage('');
          setSelectedImage('');
          fetchMessages();
        }
      } catch (error) {
        console.log("error in sending the message", error);
      }
    };
  
    const deleteMessage = async (messageIds: string[]) => {
      try {
        const response = await fetch("http://172.20.10.6:8000/deleteMessages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: messageIds })
        });
  
        if (response.ok) {
          setSelectedMessages(prev =>
            prev.filter(id => !messageIds.includes(id))
          );
          fetchMessages();
        } else {
          console.log("error deleting message", response.status);
        }
      } catch (error) {
        console.log("error deleting messages", error);
      }
    };
  
    const pickImage = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
  
      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setSelectedImage(uri);
        await handleSend("image", uri);
      }
    };
  
    const formatTime = (time: string) => {
      const options: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "numeric" };
      return new Date(time).toLocaleString("en-US", options);
    };
  
    const handleSelectMessage = (message: Message) => {
      const isSelected = selectedMessages.includes(message._id);
      if (isSelected) {
        setSelectedMessages(prev => prev.filter(id => id !== message._id));
      } else {
        setSelectedMessages(prev => [...prev, message._id]);
      }
    };
  
    useLayoutEffect(() => {
      navigation.setOptions({
        headerTitle: "",
        headerLeft: () => (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Ionicons onPress={() => navigation.goBack()} name="arrow-back" size={24} color="black" />
            {selectedMessages.length > 0 ? (
              <Text style={{ fontSize: 16, fontWeight: "500" }}>
                {selectedMessages.length}
              </Text>
            ) : (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image
                  style={{ width: 30, height: 30, borderRadius: 15 }}
                  source={{ uri: recepientData?.image }}
                />
                <Text style={{ marginLeft: 5, fontSize: 15, fontWeight: "bold" }}>
                  {recepientData?.name}
                </Text>
              </View>
            )}
          </View>
        ),
        headerRight: () =>
          selectedMessages.length > 0 ? (
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Ionicons name="arrow-redo" size={24} color="black" />
              <Ionicons name="arrow-undo" size={24} color="black" />
              <FontAwesome name="star" size={24} color="black" />
              <MaterialIcons
                onPress={() => deleteMessage(selectedMessages)}
                name="delete"
                size={24}
                color="black"
              />
            </View>
          ) : null
      });
    }, [recepientData, selectedMessages]);
  
    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: "#F0F0F0" }}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ flexGrow: 1 }}
          onContentSizeChange={scrollToBottom}
        >
          {messages.map((item, index) => {
            const isMe = item?.senderId?._id === userId;
            const isSelected = selectedMessages.includes(item._id);
  
            const containerStyle = [
              {
                alignSelf: isMe ? "flex-end" : "flex-start",
                backgroundColor: isMe ? "#DCF8C6" : "white",
                padding: 8,
                margin: 10,
                borderRadius: 7,
                maxWidth: "60%",
              },
              isSelected && {
                width: "100%",
                backgroundColor: "#F0FFFF",
              },
            ];
  
            return (
              <Pressable
                key={index}
                onLongPress={() => handleSelectMessage(item)}
                style={containerStyle}
              >
                {item.messageType === "text" ? (
                  <Text style={{ fontSize: 13 }}>{item?.message}</Text>
                ) : (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={{ width: 200, height: 200, borderRadius: 7 }}
                  />
                )}
                <Text style={{
                  textAlign: "right",
                  fontSize: 9,
                  color: "gray",
                  marginTop: 5,
                }}>
                  {formatTime(item?.timeStamp)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
  
        <View style={styles.inputContainer}>
          <Entypo onPress={() => setShowEmojiSelector(!showEmojiSelector)} name="emoji-happy" size={24} color="gray" />
          <TextInput
            value={message}
            onChangeText={setMessage}
            style={styles.textInput}
            placeholder="Type your message..."
          />
          <Entypo onPress={pickImage} name="camera" size={24} color="gray" />
          <Feather name="mic" size={24} color="gray" style={{ marginLeft: 10 }} />
          <Pressable onPress={() => handleSend("text")} style={styles.sendButton}>
            <Text style={{ color: "white" }}>Send</Text>
          </Pressable>
        </View>
  
        {showEmojiSelector && (
          <EmojiSelector onEmojiSelected={(emoji: string) => setMessage((prev) => prev + emoji)} />
        )}
      </KeyboardAvoidingView>
    );
  };
  
  export default ChatMessageScreen;
  
  const styles = StyleSheet.create({
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      borderTopWidth: 1,
      borderTopColor: "#dddddd",
      marginBottom: 25,
    },
    textInput: {
      flex: 1,
      height: 40,
      borderWidth: 1,
      borderColor: "#dddddd",
      borderRadius: 20,
      paddingHorizontal: 10,
      marginHorizontal: 8,
    },
    sendButton: {
      backgroundColor: "blue",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      marginLeft: 8,
    },
  });
  