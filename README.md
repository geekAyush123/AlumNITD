
---

# **AlumNITD**  

A **React Native** application designed for the **NIT Delhi Alumni** network, enabling alumni and students to connect, interact, and share experiences.  

## 🚀 **Features**  
- **User Authentication** (Signup/Login with JWT & Firebase Auth)  
- **Profile Management** (Alumni & Student profiles)  
- **Feed Section** (Posts, comments, and reactions)  
- **Direct Messaging** (Chat between alumni and students)  
- **Event Management** (Alumni meetups, webinars, and job fairs)  
- **Job & Internship Listings**  
- **Mentorship Program** (Connect students with alumni mentors)  
- **Push Notifications** (Using Firebase Cloud Messaging)  

## 🛠️ **Tech Stack**  

### **Frontend**  
- **React Native** (For cross-platform mobile development)  
- **Redux Toolkit** (For state management)  
- **React Navigation** (For seamless app navigation)  
- **TailwindCSS / Styled Components** (For styling UI)  

### **Backend**  
- **Node.js with Express.js** (For API development)  
- **MongoDB with Mongoose** (For storing user data and posts)  
- **Firebase Authentication** (For secure user authentication)  
- **Cloudinary** (For image & document storage)  
- **Socket.io** (For real-time chat and notifications)  

### **Other Integrations**  
- **Google OAuth & LinkedIn OAuth** (For easy login)  
- **Push Notifications** (With Firebase Cloud Messaging)  
- **Stripe/ Razorpay** (For donations or alumni event payments)  

## 📂 **Folder Structure**  
```
AlumniApp/
│-- android/                     # Android-specific files
│-- ios/                         # iOS-specific files
│-- src/
│   ├── components/              # Reusable UI components
│   ├── screens/                 # Screens for navigation
│   ├── navigation/              # React Navigation setup
│   ├── redux/                   # Redux Toolkit setup
│   ├── utils/                   # Helper functions
│   ├── services/                # API calls & Firebase integration
│-- assets/                      # Images, fonts, icons
│-- App.js                       # Main entry point
│-- package.json                 # Dependencies & scripts
│-- .env                         # Environment variables
```

## 🔧 **Installation**  

### **1. Clone the Repository**  
```sh
git clone https://github.com/geekAyush123/AlumNITD.git
cd alumni-app
```

### **2. Install Dependencies**  
```sh
npm install  # or yarn install
```

### **3. Configure Environment Variables**  
Create a `.env` file and add:  
```env
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_BACKEND_URL=http://your-backend-url.com
REACT_APP_GOOGLE_OAUTH_CLIENT_ID=your_google_client_id
```

### **4. Start the Development Server**  
```sh
npx react-native start
```

### **5. Run the App on Emulator or Device**  
For Android:  
```sh
npx react-native run-android
```
For iOS:  
```sh
npx react-native run-ios
```



## 📜 **License**  
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.  

## 🤝 **Contributing**  
We welcome contributions! Feel free to open a PR or create an issue.  

---

**Developed by Aryaman,Ayush ,Alfred | NIT Delhi**  

---
