
// Mock Data - Simulating what is in the App
const currentTrip = {
    id: '1',
    name: 'Goa Getaway',
    members: ['You', 'Rahul', 'Neha', 'Amit'],
    expenses: [
        { id: '1', title: 'Lunch', amount: 4000, paidBy: 'Amit' }, // Amit paid 4000
        { id: '2', title: 'Villa', amount: 20000, paidBy: 'You' }, // You paid 20000
        { id: '3', title: 'Scooter', amount: 2000, paidBy: 'Rahul' }, // Rahul paid 2000
        { id: '4', title: 'Drinks', amount: 4000, paidBy: 'Neha' }, // Neha paid 4000
    ]
};

console.log("--- TripLedger Logic Demo ---\n");
console.log(`Trip: ${currentTrip.name}`);
console.log(`Members: ${currentTrip.members.join(', ')}\n`);

// 1. Calculate Total and Share
const totalSpent = currentTrip.expenses.reduce((sum, e) => sum + e.amount, 0);
const sharePerPerson = totalSpent / currentTrip.members.length;

console.log(`Total Spent: ₹${totalSpent}`);
console.log(`Per Person Share: ₹${sharePerPerson}\n`);

// 2. Calculate Balances
const balances = {};
currentTrip.members.forEach(m => balances[m] = 0);

// Add what they paid
currentTrip.expenses.forEach(e => {
    balances[e.paidBy] += e.amount;
});

// Subtract what they should have paid
currentTrip.members.forEach(m => {
    balances[m] -= sharePerPerson;
});

console.log("--- Balances (Positive = Gets back, Negative = Owes) ---");
Object.keys(balances).forEach(person => {
    console.log(`${person}: ₹${balances[person]}`);
});
console.log("\n");

// 3. Settle Up Algorithm
const debtors = [];
const creditors = [];

Object.keys(balances).forEach(m => {
    if (balances[m] < -1) debtors.push({ name: m, amount: -balances[m] });
    else if (balances[m] > 1) creditors.push({ name: m, amount: balances[m] });
});

const transactions = [];
let i = 0;
let j = 0;

while (i < debtors.length && j < creditors.length) {
    const debt = debtors[i];
    const credit = creditors[j];
    const amount = Math.min(debt.amount, credit.amount);

    if (amount > 0) {
        transactions.push(`${debt.name} owes ${credit.name} ₹${amount}`);
    }

    debt.amount -= amount;
    credit.amount -= amount;

    if (debt.amount < 1) i++;
    if (credit.amount < 1) j++;
}

console.log("--- Final Settlements (Who pays whom) ---");
if (transactions.length === 0) {
    console.log("Everyone is settled up!");
} else {
    transactions.forEach(t => console.log(t));
}
