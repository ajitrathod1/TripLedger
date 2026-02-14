# TripLedger Database Structure 🗄️

## Firestore Collections

### 1. **users** (Top-level collection)
Stores user profile information.

```
users/{userId}
├── uid: string
├── email: string
├── displayName: string
├── photoURL: string
├── createdAt: timestamp
└── updatedAt: timestamp
```

#### Subcollection: **trips** (User's trip references)
```
users/{userId}/trips/{tripId}
├── tripId: string
├── role: string ("owner" | "member")
└── addedAt: timestamp
```

---

### 2. **trips** (Top-level collection)
Stores all trip data.

```
trips/{tripId}
├── id: string
├── name: string
├── destination: string
├── startDate: string | null
├── endDate: string | null
├── budget: number
├── description: string
├── coverImage: string
│
├── ownerId: string (userId)
├── members: array<string> (array of userIds)
├── memberDetails: object
│   └── {memberId}: object
│       ├── name: string
│       ├── email: string
│       ├── role: string ("owner" | "member")
│       └── joinedAt: timestamp
│
├── expenses: array<object>
│   └── {expense}
│       ├── id: string
│       ├── title: string
│       ├── amount: number
│       ├── category: string
│       ├── paidBy: string (memberId)
│       ├── splitBetween: array<string>
│       ├── description: string
│       ├── date: string (ISO)
│       ├── receipt: string (URL)
│       └── createdAt: timestamp
│
├── createdAt: timestamp
├── updatedAt: timestamp
└── isArchived: boolean
```

---

## Database Operations

### User Operations
- `createUserProfile(userId, userData)` - Create/update user profile
- `getUserProfile(userId)` - Get user profile
- `updateUserProfile(userId, updates)` - Update user profile

### Trip Operations
- `createTrip(userId, tripData)` - Create new trip
- `getUserTrips(userId)` - Get all trips for user
- `getTrip(tripId)` - Get single trip
- `updateTrip(tripId, updates)` - Update trip
- `deleteTrip(tripId, userId)` - Delete trip
- `toggleArchiveTrip(tripId, isArchived)` - Archive/unarchive trip

### Member Operations
- `addMemberToTrip(tripId, memberData)` - Add member to trip
- `removeMemberFromTrip(tripId, memberId)` - Remove member from trip

### Expense Operations
- `addExpense(tripId, expenseData)` - Add expense
- `updateExpense(tripId, expenseId, updates)` - Update expense
- `deleteExpense(tripId, expenseId)` - Delete expense

### Real-time Listeners
- `subscribeToTrip(tripId, callback)` - Subscribe to trip updates
- `subscribeToUserTrips(userId, callback)` - Subscribe to user's trips

### Utility Functions
- `getTripStats(trip)` - Get trip statistics
- `calculateSettlements(trip)` - Calculate who owes whom

---

## Data Flow

### Creating a Trip
1. User creates trip via UI
2. `TripContext.addTrip()` called
3. If logged in:
   - `database.createTrip()` creates trip in `trips/{tripId}`
   - Adds reference in `users/{userId}/trips/{tripId}`
   - Real-time listener updates UI automatically
4. If offline:
   - Saves to AsyncStorage
   - Syncs when user logs in

### Adding an Expense
1. User adds expense via UI
2. `TripContext.addExpense()` called
3. If logged in:
   - `database.addExpense()` updates trip document
   - Adds expense to `expenses` array
   - Real-time listener updates UI
4. If offline:
   - Updates local state
   - Saves to AsyncStorage

### Settlements Calculation
1. `TripContext.getSettlements()` called
2. `calculateSettlements(trip)` runs algorithm
3. Returns array of transactions:
   ```javascript
   [
     { from: "Rahul", to: "You", amount: 1500 },
     { from: "Neha", to: "Amit", amount: 2000 }
   ]
   ```

---

## Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User profiles
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
      
      // User's trip references
      match /trips/{tripId} {
        allow read, write: if request.auth.uid == userId;
      }
    }
    
    // Trips
    match /trips/{tripId} {
      allow read: if request.auth != null && 
                     request.auth.uid in resource.data.members;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                               request.auth.uid == resource.data.ownerId;
    }
  }
}
```

---

## Offline Support

### Local Mode (Not Logged In)
- All data stored in AsyncStorage
- Full CRUD operations available
- Data persists on device

### Cloud Mode (Logged In)
- Real-time sync with Firestore
- Automatic updates across devices
- Optimistic UI updates
- Error handling with rollback

### Migration (Local → Cloud)
When user logs in:
1. Load local data from AsyncStorage
2. Sync to Firestore
3. Clear local storage (optional)
4. Subscribe to real-time updates

---

## Example Usage

### Creating a Trip
```javascript
const { addTrip } = useTripContext();

await addTrip({
  name: "Goa Trip",
  destination: "Goa, India",
  startDate: "2026-03-01",
  endDate: "2026-03-05",
  budget: 50000,
  description: "Beach vacation with friends"
});
```

### Adding an Expense
```javascript
const { addExpense } = useTripContext();

await addExpense({
  title: "Hotel Booking",
  amount: 15000,
  category: "Stay",
  paidBy: "user123",
  splitBetween: ["user123", "user456", "user789"],
  description: "3 nights at beach resort"
});
```

### Getting Settlements
```javascript
const { getSettlements } = useTripContext();

const settlements = getSettlements();
// Returns: [{ from: "Rahul", to: "You", amount: 1500 }, ...]
```

---

## Migration Guide

### From Old Structure to New Structure

**Old:**
```javascript
users/{userId}/trips/{tripId}
└── (all trip data here)
```

**New:**
```javascript
trips/{tripId}
└── (trip data with members array)

users/{userId}/trips/{tripId}
└── (just reference with role)
```

**Benefits:**
- Shared trips between multiple users
- Better query performance
- Real-time collaboration
- Easier permission management
