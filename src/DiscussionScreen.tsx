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
  Image,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { Swipeable } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

interface Blog {
  id: string;
  title: string;
  content: string;
  likes: number;
  likedBy: { [key: string]: boolean };
  comments?: Comment[];
  timestamp: number;
  authorId: string;
  authorName: string;
  authorProfilePic?: string;
}

interface Comment {
  id: string;
  text: string;
  author: string;
  authorId: string;
  timestamp: number;
}

interface UserData {
  fullName: string;
  profilePic?: string;
  role?: string;
  company?: string;
}

export default function DiscussionScreen() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [editingBlogId, setEditingBlogId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchVisible, setSearchVisible] = useState<boolean>(false);
  const [commentText, setCommentText] = useState<string>('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  const blogsRef = database().ref('/blogs');
  const usersRef = firestore().collection('users');

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const fetchUserData = async (userId: string): Promise<UserData | null> => {
    try {
      const userDoc = await usersRef.doc(userId).get();
      if (userDoc.exists) {
        const data = userDoc.data() as UserData;
        return {
          fullName: data.fullName || 'User',
          profilePic: data.profilePic,
          role: data.role,
          company: data.company,
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const fetchBlogs = async () => {
    blogsRef.on('value', async (snapshot) => {
      const blogsData = snapshot.val();
      if (blogsData) {
        const blogsArray = await Promise.all(
          Object.keys(blogsData).map(async (key) => {
            const blog = blogsData[key];
            let authorName = 'Anonymous';
            let authorProfilePic = undefined;
            
            if (blog.authorId && blog.authorId !== 'anonymous') {
              const authorData = await fetchUserData(blog.authorId);
              if (authorData) {
                authorName = authorData.fullName;
                authorProfilePic = authorData.profilePic;
              }
            }
            
            return {
              id: key,
              title: blog.title || '',
              content: blog.content || '',
              likes: blog.likes || 0,
              likedBy: blog.likedBy || {},
              comments: blog.comments ? Object.values(blog.comments) : [],
              timestamp: blog.timestamp || 0,
              authorId: blog.authorId || 'anonymous',
              authorName,
              authorProfilePic,
            };
          })
        );
        
        setBlogs(blogsArray.sort((a, b) => {
          if (b.likes !== a.likes) return b.likes - a.likes;
          return b.timestamp - a.timestamp;
        }));
      } else {
        setBlogs([]);
      }
    });
  };

  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      if (user) {
        const data = await fetchUserData(user.uid);
        setUserData(data);
      } else {
        setUserData(null);
      }
    });

    fetchBlogs();
    
    return () => {
      blogsRef.off('value');
    };
  }, []);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);

    try {
      if (editingBlogId) {
        await blogsRef.child(editingBlogId).update({
          title,
          content,
          timestamp: Date.now(),
        });
        
        Toast.show({
          type: 'success',
          text1: 'Discussion updated!',
          position: 'bottom',
        });
      } else {
        await blogsRef.push({
          title,
          content,
          likes: 0,
          likedBy: {},
          comments: {},
          timestamp: Date.now(),
          authorId: currentUser?.uid || 'anonymous',
          authorName: userData?.fullName || 'Anonymous',
        });
        
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
    setReplyingTo(null);
    setCommentText('');
  };

  const handleEdit = (blog: Blog) => {
    setTitle(blog.title);
    setContent(blog.content);
    setEditingBlogId(blog.id);
    setExpandedPost(blog.id);
  };

  const handleDelete = async (id: string) => {
    try {
      await blogsRef.child(id).remove();
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

  const handleLike = async (blogId: string) => {
    if (!currentUser) {
      Toast.show({
        type: 'error',
        text1: 'Please sign in to like discussions',
        position: 'bottom',
      });
      return;
    }

    try {
      const blogRef = blogsRef.child(blogId);
      const blog = blogs.find(b => b.id === blogId);
      
      if (!blog) return;
      
      const userId = currentUser.uid;
      const isLiked = blog.likedBy && blog.likedBy[userId];
      
      await blogRef.update({
        likes: isLiked ? blog.likes - 1 : blog.likes + 1,
        [`likedBy/${userId}`]: !isLiked,
      });
      
    } catch (err) {
      console.error('Like error:', err);
      Toast.show({
        type: 'error',
        text1: 'Failed to update like!',
        position: 'bottom',
      });
    }
  };

  const handleAddComment = async (blogId: string) => {
    if (!commentText.trim()) return;
    if (!currentUser) {
      Toast.show({
        type: 'error',
        text1: 'Please sign in to add comments',
        position: 'bottom',
      });
      return;
    }
    
    try {
      const commentsRef = blogsRef.child(`${blogId}/comments`);
      const newCommentRef = commentsRef.push();
      
      await newCommentRef.set({
        text: commentText,
        author: userData?.fullName || 'User',
        authorId: currentUser.uid,
        timestamp: Date.now(),
      });
      
      setCommentText('');
      setReplyingTo(null);
      
      Toast.show({
        type: 'success',
        text1: 'Comment added!',
        position: 'bottom',
      });
    } catch (err) {
      console.error('Comment error:', err);
      Toast.show({
        type: 'error',
        text1: 'Failed to add comment!',
        position: 'bottom',
      });
    }
  };

  const toggleExpandPost = (blogId: string) => {
    setExpandedPost(expandedPost === blogId ? null : blogId);
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
    if (blog.authorId !== currentUser?.uid) {
      return null;
    }

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
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderComment = (comment: Comment) => (
    <View style={styles.commentContainer} key={comment.id}>
      <Text style={styles.commentAuthor}>{comment.author}</Text>
      <Text style={styles.commentText}>{comment.text}</Text>
    </View>
  );

  const renderItem: ListRenderItem<Blog> = ({ item }) => (
    <Swipeable
      renderLeftActions={(progress, dragX) =>
        renderLeftActions(progress, dragX, item)
      }
      renderRightActions={(progress, dragX) =>
        renderRightActions(progress, dragX, item.id)
      }
    >
      <View style={styles.blogCard}>
        <TouchableOpacity onPress={() => toggleExpandPost(item.id)}>
          <View style={styles.postHeader}>
            <View style={styles.authorContainer}>
              {item.authorProfilePic && (
                <Image 
                  source={{ uri: item.authorProfilePic }} 
                  style={styles.profilePic}
                />
              )}
              <View>
                <Text style={styles.authorName}>{item.authorName}</Text>
                {item.authorId !== 'anonymous' && (
                  <Text style={styles.authorRole}>
                    {userData?.role || 'Member'} • {userData?.company || ''}
                  </Text>
                )}
              </View>
            </View>
            <Text style={styles.timestamp}>
              {formatDate(item.timestamp)}
            </Text>
          </View>
          <Text style={styles.blogTitle}>{item.title}</Text>
          <Text style={styles.blogContent}>{item.content}</Text>
          
          <View style={styles.postFooter}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleLike(item.id)}
            >
              <Ionicons 
                name={item.likedBy && item.likedBy[currentUser?.uid] ? 'heart' : 'heart-outline'} 
                size={20} 
                color={item.likedBy && item.likedBy[currentUser?.uid] ? '#E91E63' : '#F3E5F5'} 
              />
              <Text style={styles.actionText}>{item.likes}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => {
                setReplyingTo(item.id);
                setExpandedPost(item.id);
              }}
            >
              <Ionicons name="chatbubble-outline" size={20} color="#F3E5F5" />
              <Text style={styles.actionText}>{item.comments ? item.comments.length : 0}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {expandedPost === item.id && (
          <View style={styles.expandedContent}>
            {item.comments && item.comments.length > 0 ? (
              <View style={styles.commentsSection}>
                <Text style={styles.commentsHeader}>Comments:</Text>
                {item.comments.map(renderComment)}
              </View>
            ) : (
              <Text style={styles.noCommentsText}>No comments yet</Text>
            )}
            
            {(replyingTo === item.id) && (
              <View style={styles.commentForm}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment..."
                  placeholderTextColor="#D1C4E9"
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                />
                <View style={styles.commentButtons}>
                  <Button
                    title="Post"
                    onPress={() => handleAddComment(item.id)}
                    color="#6A1B9A"
                  />
                  <Button
                    title="Cancel"
                    onPress={() => setReplyingTo(null)}
                    color="#C2185B"
                  />
                </View>
              </View>
            )}
            
            {item.authorId === currentUser?.uid && (
              <Text style={styles.editHint}>
                Swipe right to edit / Swipe left to delete
              </Text>
            )}
          </View>
        )}
      </View>
    </Swipeable>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#4A148C' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor: '#4A148C' }} 
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
            placeholder="Search discussions..."
            placeholderTextColor="#E1BEE7"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        )}

        <FlatList
          data={filteredBlogs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 40 }}
          scrollEnabled={false}
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
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  authorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F8BBD0',
  },
  authorRole: {
    fontSize: 12,
    color: '#CE93D8',
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8BBD0',
    marginBottom: 6,
  },
  blogContent: {
    fontSize: 14,
    color: '#E1BEE7',
    marginBottom: 10,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    marginLeft: 5,
    color: '#F3E5F5',
  },
  timestamp: {
    fontSize: 12,
    color: '#CE93D8',
  },
  expandedContent: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#9C27B0',
    paddingTop: 10,
  },
  commentsSection: {
    marginBottom: 10,
  },
  commentsHeader: {
    fontWeight: 'bold',
    color: '#F8BBD0',
    marginBottom: 5,
  },
  commentContainer: {
    backgroundColor: '#9C27B0',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentAuthor: {
    fontWeight: 'bold',
    color: '#F8BBD0',
    fontSize: 12,
  },
  commentText: {
    color: '#E1BEE7',
    fontSize: 14,
  },
  noCommentsText: {
    color: '#CE93D8',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  commentForm: {
    marginTop: 10,
  },
  commentInput: {
    borderColor: '#CE93D8',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    color: '#FFFFFF',
    backgroundColor: '#6A1B9A',
    minHeight: 60,
  },
  commentButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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