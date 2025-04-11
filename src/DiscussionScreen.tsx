import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ListRenderItem,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Swipeable } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';

const BASE_URL = 'http://10.10.48.40:3000';

interface Blog {
  _id: string;
  title: string;
  content: string;
}

export default function DiscussionScreen() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchVisible, setSearchVisible] = useState<boolean>(false);

  const fetchBlogs = async () => {
    try {
      const res = await fetch(`${BASE_URL}/blogs`);
      const data = await res.json();
      setBlogs(data);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);

    try {
      if (editingBlogId) {
        const res = await fetch(`${BASE_URL}/blogs/${editingBlogId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
        });
        const updated: Blog = await res.json();
        setBlogs((prev) =>
          prev.map((b) => (b._id === updated._id ? updated : b))
        );
        Toast.show({
          type: 'success',
          text1: 'Discussion updated!',
          position: 'bottom',
        });
      } else {
        const res = await fetch(`${BASE_URL}/blogs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
        });
        const newBlog: Blog = await res.json();
        setBlogs([newBlog, ...blogs]);
        Toast.show({
          type: 'success',
          text1: 'Discussion added!',
          position: 'bottom',
        });
      }
      resetForm();
    } catch (err) {
      console.error('Submit error:', err);
      Toast.show({
        type: 'error',
        text1: 'Something went wrong!',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setEditingBlogId(null);
  };

  const handleEdit = (blog: Blog) => {
    setTitle(blog.title);
    setContent(blog.content);
    setEditingBlogId(blog._id);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${BASE_URL}/blogs/${id}`, {
        method: 'DELETE',
      });
      setBlogs((prev) => prev.filter((blog) => blog._id !== id));
      if (editingBlogId === id) resetForm();
      Toast.show({
        type: 'success',
        text1: 'Discussion deleted!',
        position: 'bottom',
      });
    } catch (err) {
      console.error('Delete error:', err);
      Toast.show({
        type: 'error',
        text1: 'Failed to delete discussion!',
        position: 'bottom',
      });
    }
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    id: string
  ) => {
    const scale = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
    return (
      <TouchableOpacity onPress={() => handleDelete(id)}>
        <View style={styles.deleteButton}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons name="trash-outline" size={24} color="white" />
            <Text style={styles.deleteText}>Delete</Text>
          </Animated.View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
    blog: Blog
  ) => {
    const scale = dragX.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
    return (
      <TouchableOpacity onPress={() => handleEdit(blog)}>
        <View style={styles.editButton}>
          <Animated.View style={{ transform: [{ scale }] }}>
            <Ionicons name="create-outline" size={24} color="white" />
            <Text style={styles.editText}>Edit</Text>
          </Animated.View>
        </View>
      </TouchableOpacity>
    );
  };

  const filteredBlogs = blogs.filter((blog) =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderItem: ListRenderItem<Blog> = ({ item }) => (
    <Swipeable
      renderLeftActions={(progress, dragX) =>
        renderLeftActions(progress, dragX, item)
      }
      renderRightActions={(progress, dragX) =>
        renderRightActions(progress, dragX, item._id)
      }
    >
      <TouchableOpacity
        style={styles.blogCard}
        onPress={() => handleEdit(item)}
      >
        <Text style={styles.blogTitle}>{item.title}</Text>
        <Text style={styles.blogContent}>{item.content}</Text>
        <Text style={styles.editHint}>
          Swipe right to edit / Swipe left to delete
        </Text>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>
          {editingBlogId ? 'Edit Discussion' : 'Discussion Room'}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Title"
          placeholderTextColor="#D1C4E9"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Content"
          placeholderTextColor="#D1C4E9"
          multiline
          value={content}
          onChangeText={setContent}
        />

        <View style={styles.buttonRow}>
          <Button
            title={
              editingBlogId
                ? loading
                  ? 'Updating...'
                  : 'Update Discussion'
                : loading
                ? 'Adding...'
                : 'Add Discussion'
            }
            onPress={handleSubmit}
            disabled={loading}
            color="#6A1B9A"
          />
          {editingBlogId && (
            <View style={{ marginLeft: 10 }}>
              <Button title="Cancel" onPress={resetForm} color="#C2185B" />
            </View>
          )}
        </View>

        <View style={styles.searchHeader}>
          <Text style={styles.header}>Discussion Forum</Text>
          <TouchableOpacity onPress={() => setSearchVisible(!searchVisible)}>
            <Ionicons name="search-outline" size={24} color="#F3E5F5" />
          </TouchableOpacity>
        </View>

        {searchVisible && (
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title..."
            placeholderTextColor="#E1BEE7"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        )}

        <FlatList
          data={filteredBlogs}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 60,
    backgroundColor: '#4A148C',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#F3E5F5',
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    borderColor: '#CE93D8',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    color: '#FFFFFF',
    backgroundColor: '#6A1B9A',
  },
  searchInput: {
    borderColor: '#BA68C8',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    color: '#FFFFFF',
    backgroundColor: '#8E24AA',
  },
  blogCard: {
    padding: 14,
    backgroundColor: '#7B1FA2',
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8BBD0',
  },
  blogContent: {
    fontSize: 14,
    marginTop: 6,
    color: '#E1BEE7',
  },
  editHint: {
    marginTop: 8,
    fontSize: 12,
    fontStyle: 'italic',
    color: '#CE93D8',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  deleteButton: {
    backgroundColor: '#AD1457',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 8,
    marginBottom: 10,
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 4,
  },
  editButton: {
    backgroundColor: '#6A1B9A',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 8,
    marginBottom: 10,
  },
  editText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 4,
  },
});
