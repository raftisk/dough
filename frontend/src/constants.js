// Preset categories for Dough expense tracker
// These are common categories that users can add to their active list
// Note: Avoid duplicating categories that already exist in mock data
// (Groceries, Transportation, Entertainment, Utilities, Salary, Freelance are in Dashboard mocks)

export const PRESET_CATEGORIES = {
  expense: [
    { name: 'Dining Out', icon: '🍔' },
    { name: 'Gas & Fuel', icon: '⛽' },
    { name: 'Parking', icon: '🅿️' },
    { name: 'Public Transit', icon: '🚇' },
    { name: 'Rent', icon: '🏠' },
    { name: 'Internet', icon: '🌐' },
    { name: 'Phone', icon: '📱' },
    { name: 'Shopping', icon: '🛍️' },
    { name: 'Healthcare', icon: '⚕️' },
    { name: 'Fitness', icon: '💪' },
    { name: 'Education', icon: '📚' },
    { name: 'Personal Care', icon: '💅' },
    { name: 'Subscriptions', icon: '📺' },
    { name: 'Insurance', icon: '🛡️' },
    { name: 'Travel', icon: '✈️' },
    { name: 'Gifts', icon: '🎁' },
    { name: 'Clothing', icon: '👕' },
    { name: 'Pet Care', icon: '🐾' },
    { name: 'Home Maintenance', icon: '🔧' },
    { name: 'Coffee & Snacks', icon: '☕' },
    { name: 'Taxes', icon: '🧾' },
    { name: 'Other Expenses', icon: '📁' },
  ],
  income: [
    { name: 'Business', icon: '🏢' },
    { name: 'Investments', icon: '📈' },
    { name: 'Dividend', icon: '💰' },
    { name: 'Interest', icon: '🏦' },
    { name: 'Rental Income', icon: '🏘️' },
    { name: 'Bonus', icon: '🎉' },
    { name: 'Gift Received', icon: '🎁' },
    { name: 'Refund', icon: '💵' },
    { name: 'Cashback', icon: '💳' },
    { name: 'Other Income', icon: '📁' },
  ],
};

export default PRESET_CATEGORIES;
