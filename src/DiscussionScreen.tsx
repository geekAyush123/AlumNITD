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
  
            // Properly type the comments array
            const comments: Comment[] = blog.comments 
              ? Object.entries(blog.comments).map(([commentId, commentData]) => {
                  // Type assertion for commentData
                  const typedCommentData = commentData as {
                    text: string;
                    author: string;
                    authorId: string;
                    timestamp: number;
                  };
                  return {
                    id: commentId,
                    text: typedCommentData.text || '',
                    author: typedCommentData.author || 'Anonymous',
                    authorId: typedCommentData.authorId || 'anonymous',
                    timestamp: typedCommentData.timestamp || 0,
                  };
                })
              : [];
            
            return {
              id: key,
              title: blog.title || '',
              content: blog.content || '',
              likes: blog.likes || 0,
              likedBy: blog.likedBy || {},
              comments,
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
      style={{ flex: 1, backgroundColor: '#1A1A2E' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { flexGrow: 1 }]}
        keyboardShouldPersistTaps="handled"
        style={{ backgroundColor: '#1A1A2E' }} 
      >
        <TextInput
          style={styles.input}
          placeholder="Title"
          placeholderTextColor="#A89CFF"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, { height: 100 }]}
          placeholder="Content"
          placeholderTextColor="#A89CFF"
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
            color="#7E6BFF"
          />
          {editingBlogId && (
            <View style={{ marginLeft: 10 }}>
              <Button title="Cancel" onPress={resetForm} color="#FF4D4D" />
            </View>
          )}
        </View>

        <View style={styles.searchHeader}>
          <Text style={styles.header}>Discussion Forum</Text>
          <TouchableOpacity onPress={() => setSearchVisible(!searchVisible)}>
            <Ionicons name="search-outline" size={24} color="#E2E2FF" />
          </TouchableOpacity>
        </View>

        {searchVisible && (
          <TextInput
            style={styles.searchInput}
            placeholder="Search discussions..."
            placeholderTextColor="#A89CFF"
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
    backgroundColor: '#1A1A2E',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#E2E2FF',
    fontFamily: 'Roboto-Medium',
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  input: {
    borderColor: '#7E6BFF',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    color: '#FFFFFF',
    backgroundColor: '#16213E',
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  searchInput: {
    borderColor: '#7E6BFF',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    color: '#FFFFFF',
    backgroundColor: '#16213E',
    fontSize: 16,
    fontFamily: 'Roboto-Regular',
  },
  blogCard: {
    padding: 18,
    backgroundColor: '#16213E',
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#7E6BFF',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#7E6BFF',
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E2E2FF',
    fontFamily: 'Roboto-Medium',
  },
  authorRole: {
    fontSize: 12,
    color: '#A89CFF',
    fontFamily: 'Roboto-Regular',
  },
  blogTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'Roboto-Bold',
  },
  blogContent: {
    fontSize: 15,
    color: '#D1D1FF',
    marginBottom: 12,
    lineHeight: 22,
    fontFamily: 'Roboto-Regular',
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(126, 107, 255, 0.2)',
  },
  actionText: {
    marginLeft: 8,
    color: '#E2E2FF',
    fontFamily: 'Roboto-Medium',
  },
  timestamp: {
    fontSize: 12,
    color: '#A89CFF',
    fontFamily: 'Roboto-Regular',
  },
  expandedContent: {
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(126, 107, 255, 0.3)',
    paddingTop: 14,
  },
  commentsSection: {
    marginBottom: 14,
  },
  commentsHeader: {
    fontWeight: 'bold',
    color: '#E2E2FF',
    marginBottom: 10,
    fontSize: 16,
    fontFamily: 'Roboto-Medium',
  },
  commentContainer: {
    backgroundColor: 'rgba(126, 107, 255, 0.15)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  commentAuthor: {
    fontWeight: '600',
    color: '#E2E2FF',
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'Roboto-Medium',
  },
  commentText: {
    color: '#D1D1FF',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Roboto-Regular',
  },
  noCommentsText: {
    color: '#A89CFF',
    fontStyle: 'italic',
    marginBottom: 14,
    fontFamily: 'Roboto-Italic',
  },
  commentForm: {
    marginTop: 14,
  },
  commentInput: {
    borderColor: '#7E6BFF',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    color: '#FFFFFF',
    backgroundColor: '#16213E',
    minHeight: 80,
    fontSize: 15,
    fontFamily: 'Roboto-Regular',
    textAlignVertical: 'top',
  },
  commentButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  editHint: {
    marginTop: 12,
    fontSize: 12,
    fontStyle: 'italic',
    color: '#A89CFF',
    textAlign: 'center',
    fontFamily: 'Roboto-Italic',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  deleteButton: {
    backgroundColor: '#FF4D4D',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '80%',
    borderRadius: 10,
    marginBottom: 10,
  },
  deleteText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 4,
    fontFamily: 'Roboto-Bold',
  },
  editButton: {
    backgroundColor: '#7E6BFF',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '80%',
    borderRadius: 10,
    marginBottom: 10,
  },
  editText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 4,
    fontFamily: 'Roboto-Bold',
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    flex: 1,
  },
});