import {
  // Food & Dining
  Utensils, Coffee, Pizza, UtensilsCrossed,

  // Transportation
  Car, Fuel, Train, Plane, Bus, Bike,

  // Housing & Utilities
  Home, Zap, Wifi, Smartphone, Droplet,

  // Shopping & Personal
  ShoppingBag, ShoppingCart, Shirt, Sparkles,

  // Health & Fitness
  Heart, Activity, Dumbbell, Pill, Stethoscope,

  // Work & Education
  Briefcase, GraduationCap, BookOpen, Pencil, Laptop,

  // Entertainment
  Film, Music, Tv, Gamepad2,

  // Financial
  CreditCard, Wallet, TrendingUp, PiggyBank, DollarSign, Building2,
  Landmark, RotateCcw, Receipt, Shield, PartyPopper, Gift,

  // Other
  Wrench, PawPrint, Folder, Package,
} from 'lucide-react';

// Preset categories for Dough expense tracker
export const PRESET_CATEGORIES = {
  expense: [
    { name: 'Dining Out', icon: Utensils, iconName: 'Utensils' },
    { name: 'Groceries', icon: ShoppingCart, iconName: 'ShoppingCart' },
    { name: 'Coffee & Snacks', icon: Coffee, iconName: 'Coffee' },
    { name: 'Gas & Fuel', icon: Fuel, iconName: 'Fuel' },
    { name: 'Parking', icon: Car, iconName: 'Car' },
    { name: 'Public Transit', icon: Train, iconName: 'Train' },
    { name: 'Rent', icon: Home, iconName: 'Home' },
    { name: 'Utilities', icon: Zap, iconName: 'Zap' },
    { name: 'Internet', icon: Wifi, iconName: 'Wifi' },
    { name: 'Phone', icon: Smartphone, iconName: 'Smartphone' },
    { name: 'Shopping', icon: ShoppingBag, iconName: 'ShoppingBag' },
    { name: 'Clothing', icon: Shirt, iconName: 'Shirt' },
    { name: 'Healthcare', icon: Stethoscope, iconName: 'Stethoscope' },
    { name: 'Fitness', icon: Dumbbell, iconName: 'Dumbbell' },
    { name: 'Education', icon: BookOpen, iconName: 'BookOpen' },
    { name: 'Personal Care', icon: Sparkles, iconName: 'Sparkles' },
    { name: 'Subscriptions', icon: Tv, iconName: 'Tv' },
    { name: 'Insurance', icon: Shield, iconName: 'Shield' },
    { name: 'Travel', icon: Plane, iconName: 'Plane' },
    { name: 'Entertainment', icon: Film, iconName: 'Film' },
    { name: 'Gifts', icon: Gift, iconName: 'Gift' },
    { name: 'Pet Care', icon: PawPrint, iconName: 'PawPrint' },
    { name: 'Home Maintenance', icon: Wrench, iconName: 'Wrench' },
    { name: 'Taxes', icon: Receipt, iconName: 'Receipt' },
    { name: 'Other Expenses', icon: Folder, iconName: 'Folder' },
  ],
  income: [
    { name: 'Salary', icon: Briefcase, iconName: 'Briefcase' },
    { name: 'Freelance', icon: Laptop, iconName: 'Laptop' },
    { name: 'Business', icon: Building2, iconName: 'Building2' },
    { name: 'Investments', icon: TrendingUp, iconName: 'TrendingUp' },
    { name: 'Dividend', icon: DollarSign, iconName: 'DollarSign' },
    { name: 'Interest', icon: Landmark, iconName: 'Landmark' },
    { name: 'Rental Income', icon: Home, iconName: 'Home' },
    { name: 'Bonus', icon: PartyPopper, iconName: 'PartyPopper' },
    { name: 'Gift Received', icon: Gift, iconName: 'Gift' },
    { name: 'Refund', icon: RotateCcw, iconName: 'RotateCcw' },
    { name: 'Cashback', icon: CreditCard, iconName: 'CreditCard' },
    { name: 'Other Income', icon: Folder, iconName: 'Folder' },
  ],
};

// Icon name to component mapping (for database storage/retrieval)
export const ICON_MAP = {
  'Utensils': Utensils,
  'Coffee': Coffee,
  'Pizza': Pizza,
  'UtensilsCrossed': UtensilsCrossed,
  'ShoppingCart': ShoppingCart,
  'Fuel': Fuel,
  'Car': Car,
  'Train': Train,
  'Plane': Plane,
  'Bus': Bus,
  'Bike': Bike,
  'Home': Home,
  'Zap': Zap,
  'Wifi': Wifi,
  'Smartphone': Smartphone,
  'Droplet': Droplet,
  'ShoppingBag': ShoppingBag,
  'Shirt': Shirt,
  'Sparkles': Sparkles,
  'Heart': Heart,
  'Activity': Activity,
  'Dumbbell': Dumbbell,
  'Pill': Pill,
  'Stethoscope': Stethoscope,
  'Briefcase': Briefcase,
  'GraduationCap': GraduationCap,
  'BookOpen': BookOpen,
  'Pencil': Pencil,
  'Laptop': Laptop,
  'Film': Film,
  'Music': Music,
  'Tv': Tv,
  'Gamepad2': Gamepad2,
  'CreditCard': CreditCard,
  'Wallet': Wallet,
  'TrendingUp': TrendingUp,
  'PiggyBank': PiggyBank,
  'DollarSign': DollarSign,
  'Building2': Building2,
  'Landmark': Landmark,
  'RotateCcw': RotateCcw,
  'Receipt': Receipt,
  'Shield': Shield,
  'PartyPopper': PartyPopper,
  'Gift': Gift,
  'Wrench': Wrench,
  'PawPrint': PawPrint,
  'Folder': Folder,
  'Package': Package,
};

// Helper function to get icon component from name
export const getIconComponent = (iconName) => {
  return ICON_MAP[iconName] || Folder; // Default to Folder if not found
};

// Common currencies for currency picker
export const CURRENCIES = [
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱' },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft' },
  { code: 'ILS', name: 'Israeli Shekel', symbol: '₪' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
];

export default PRESET_CATEGORIES;
