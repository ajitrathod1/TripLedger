# Firebase Setup Guide for TripLedger 🔥

## Prerequisites
- Firebase account (free tier is sufficient)
- Node.js and npm installed
- Expo CLI installed

---

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `TripLedger` (or your choice)
4. Disable Google Analytics (optional)
5. Click **"Create project"**

---

## Step 2: Register Your App

1. In Firebase Console, click the **Web icon** (`</>`)
2. Register app with nickname: `TripLedger Web`
3. **Don't** check "Firebase Hosting" (unless you want to deploy)
4. Click **"Register app"**
5. Copy the `firebaseConfig` object

---

## Step 3: Update Firebase Config

Open `src/firebase/config.js` and replace with your config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

⚠️ **IMPORTANT:** Add `config.js` to `.gitignore` if sharing code publicly!

---

## Step 4: Enable Authentication

1. In Firebase Console, go to **Authentication** → **Get started**
2. Click **Sign-in method** tab
3. Enable **Email/Password**:
   - Click on "Email/Password"
   - Toggle **Enable**
   - Click **Save**
4. (Optional) Enable **Google** sign-in:
   - Click on "Google"
   - Toggle **Enable**
   - Select support email
   - Click **Save**

---

## Step 5: Create Firestore Database

1. In Firebase Console, go to **Firestore Database** → **Create database**
2. Select **Start in production mode** (we'll add rules later)
3. Choose location: `asia-south1 (Mumbai)` or closest to you
4. Click **Enable**

---

## Step 6: Set Up Security Rules

1. In Firestore, go to **Rules** tab
2. Copy the rules from `firestore.rules` file in the project
3. Paste into the Firebase Console
4. Click **Publish**

Or use Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## Step 7: Create Firestore Indexes (Optional)

For better query performance, create these indexes:

### Index 1: User Trips
- Collection: `users/{userId}/trips`
- Fields:
  - `addedAt` (Descending)
- Query scope: Collection

### Index 2: Trip Expenses
- Collection: `trips`
- Fields:
  - `members` (Array)
  - `createdAt` (Descending)
- Query scope: Collection

**How to create:**
1. Go to **Firestore** → **Indexes** tab
2. Click **Create Index**
3. Add fields as shown above
4. Click **Create**

---

## Step 8: Install Dependencies

```bash
npm install firebase
npm install @react-native-async-storage/async-storage
```

For Expo:
```bash
npx expo install firebase
npx expo install @react-native-async-storage/async-storage
```

---

## Step 9: Test the Setup

1. Start your app:
   ```bash
   npx expo start
   ```

2. Try signing up with email/password
3. Check Firebase Console:
   - **Authentication** → Should see new user
   - **Firestore** → Should see `users` collection

---

## Step 10: Environment Variables (Optional but Recommended)

For better security, use environment variables:

### Create `.env` file:
```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
```

### Install dotenv:
```bash
npm install react-native-dotenv
```

### Update `config.js`:
```javascript
import {
    FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID
} from '@env';

const firebaseConfig = {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
    storageBucket: FIREBASE_STORAGE_BUCKET,
    messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
    appId: FIREBASE_APP_ID
};
```

### Add to `.gitignore`:
```
.env
src/firebase/config.js
```

---

## Troubleshooting

### Error: "Firebase: Error (auth/invalid-api-key)"
- Check if API key is correct in `config.js`
- Ensure no extra spaces or quotes

### Error: "Missing or insufficient permissions"
- Check Firestore security rules
- Ensure user is authenticated
- Verify rules are published

### Error: "Network request failed"
- Check internet connection
- Verify Firebase project is active
- Check if Firestore is enabled

### Expenses not syncing
- Check if user is logged in
- Verify trip exists in Firestore
- Check browser console for errors

---

## Firebase Emulator (For Development)

To test locally without using production database:

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase:
   ```bash
   firebase init
   ```
   - Select **Firestore** and **Emulators**
   - Choose existing project
   - Accept default files

4. Start emulators:
   ```bash
   firebase emulators:start
   ```

5. Update `config.js` to use emulator:
   ```javascript
   import { connectFirestoreEmulator } from 'firebase/firestore';
   import { connectAuthEmulator } from 'firebase/auth';
   
   // After initializing
   if (__DEV__) {
       connectFirestoreEmulator(db, 'localhost', 8080);
       connectAuthEmulator(auth, 'http://localhost:9099');
   }
   ```

---

## Production Checklist

Before deploying to production:

- [ ] Environment variables configured
- [ ] Security rules tested and published
- [ ] Indexes created for queries
- [ ] API keys secured (not in public repo)
- [ ] Error handling implemented
- [ ] Offline support tested
- [ ] Authentication flows tested
- [ ] Data validation on client and server
- [ ] Backup strategy in place

---

## Useful Firebase Commands

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes

# View logs
firebase functions:log

# Open Firebase Console
firebase open

# Check project info
firebase projects:list
```

---

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Modeling](https://firebase.google.com/docs/firestore/data-model)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)
- [React Native Firebase](https://rnfirebase.io/)

---

## Support

If you face any issues:
1. Check Firebase Console for errors
2. Review browser console logs
3. Check Firestore security rules
4. Verify authentication state
5. Test with Firebase Emulator

---

**Happy Coding! 🚀**
