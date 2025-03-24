import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet 
} from "react-native";

interface DirectMessagePopupProps {
  alumniId: string;
  onClose: () => void;
}

const DirectMessagePopup: React.FC<DirectMessagePopupProps> = ({ alumniId, onClose }) => {
  const [message, setMessage] = useState("");

  const handleSendMessage = () => {
    if (message.trim()) {
      console.log(`Sending message to alumni ${alumniId}: ${message}`);
      // TODO: Integrate API or Firebase messaging service
      onClose();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Send a Message</Text>
      <TextInput
        style={styles.input}
        placeholder="Type your message..."
        value={message}
        onChangeText={setMessage}
        multiline
      />
      <TouchableOpacity 
        style={styles.sendButton} 
        onPress={handleSendMessage}
        accessibilityLabel="Send Message"
      >
        <Text style={styles.sendButtonText}>Send</Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.closeButton} 
        onPress={onClose}
        accessibilityLabel="Close Popup"
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    width: 320,
    elevation: 5, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    padding: 12,
    marginBottom: 12,
    minHeight: 120, // More space for typing
  },
  sendButton: {
    backgroundColor: "#4A00E0",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  sendButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "black",
    fontWeight: "bold",
  },
});

export default DirectMessagePopup;
