# TripLedger 🌍✈️💰

**TripLedger** is a smart expense splitting app designed for group trips. It helps you track who paid for what and automatically calculates "who owes whom" in the toughest scenarios.

## Features ✨

### Core Features
- **Create & Edit Trips**: Set destinations, dates, budgets, and update them anytime
- **Track Expenses**: Log expenses in categories like Food, Travel, Stay
- **View All Transactions**: See a complete history of all trip expenses sorted by date
- **Smart Settle Up**: Uses an optimized algorithm to minimize the number of transactions required to settle debts
- **Visual Charts**: See where your money is going with intuitive pie charts
- **Multi-Member Support**: Add friends and family to your trips
- **Real-time Sync**: Changes sync instantly across all devices (when logged in)

### Authentication & Cloud Sync
- **Email/Password Login**: Secure authentication with Firebase
- **Google Sign-In**: Quick login with Google account (Web only)
- **Cloud Backup**: All your trips backed up to Firestore
- **Offline Support**: Works offline, syncs when online
- **Multi-Device**: Access your trips from any device

### Smart Features
- **Automatic Settlements**: Calculates optimal payment flow
- **Category Tracking**: Organize expenses by type
- **Trip Statistics**: View spending breakdown and insights
- **Member Management**: Add/remove trip members easily
- **Glassmorphism UI**: Modern, beautiful interface
- **Dark/Light Theme**: Switch between themes

## Tech Stack 🛠️

### Frontend
- **Framework**: React Native (Expo)
- **State Management**: Context API
- **Navigation**: React Navigation
- **UI**: Custom components with Glassmorphism

### Backend & Database
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Offline Storage**: AsyncStorage
- **Real-time Updates**: Firestore listeners

### Libraries
- **Charts**: react-native-chart-kit
- **Gradients**: expo-linear-gradient
- **Icons**: @expo/vector-icons

## Project Structure 📁

```
TripLedger/
├── src/
│   ├── components/        # Reusable UI components
│   ├── constants/         # Colors, themes, constants
│   ├── context/          # React Context (Auth, Trip, Theme)
│   ├── firebase/         # Firebase config & database service
│   ├── navigation/       # Navigation setup
│   ├── screens/          # App screens
│   └── utils/            # Helper functions
├── DATABASE.md           # Database structure documentation
├── FIREBASE_SETUP.md     # Firebase setup guide
├── firestore.rules       # Firestore security rules
└── README.md            # This file
```

## How to Run 🚀

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Firebase account (for cloud features)

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/yourusername/TripLedger.git
   cd TripLedger
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase** (See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md))
   - Create Firebase project
   - Enable Authentication (Email/Password)
   - Enable Firestore Database
   - Update `src/firebase/config.js` with your credentials

4. **Start the app**
   ```bash
   npx expo start
   ```

5. **Run on device/emulator**
   - Press `a` for Android
   - Press `i` for iOS
   - Press `w` for Web
   - Or scan QR code with Expo Go app

## Usage Guide 📖

### Creating a Trip
1. Sign up or log in
2. Tap "Create Trip" button
3. Enter trip details (name, destination, dates, budget)
4. Add members to the trip
5. Start adding expenses!

### Adding Expenses
1. Select a trip from the list
2. Tap "Add Expense" button
3. Enter expense details:
   - Title (e.g., "Dinner at Beach Shack")
   - Amount
   - Category (Food, Travel, Stay, etc.)
   - Who paid
   - Split between which members
4. Save expense

### Settling Up
1. Go to "Settle Up" screen
2. View who owes whom
3. App shows minimum transactions needed
4. Mark payments as done

## Database Structure 🗄️

See [DATABASE.md](./DATABASE.md) for detailed Firestore schema and operations.

### Key Collections
- `users/{userId}` - User profiles
- `users/{userId}/trips/{tripId}` - User's trip references
- `trips/{tripId}` - Trip data with expenses and members

## Security 🔒

- Firestore security rules ensure users can only access their own trips
- Trip members can view and add expenses
- Only trip owner can delete trips
- All authentication handled by Firebase Auth

## Offline Support 📴

- Works completely offline when not logged in
- Data stored in AsyncStorage
- Syncs to cloud when user logs in
- Real-time updates when online

## Contributing 🤝

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Roadmap 🗺️

- [ ] Split expenses unequally
- [ ] Receipt image upload
- [ ] Export trip summary as PDF
- [ ] Multi-currency support
- [ ] Trip templates
- [ ] Expense categories customization
- [ ] Push notifications for new expenses
- [ ] Trip sharing via link

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- Firebase for backend infrastructure
- Expo for amazing React Native tooling
- React Navigation for smooth navigation
- The open-source community

---

**Made with ❤️ for travelers who split bills**

For issues or questions, please open an issue on GitHub.

