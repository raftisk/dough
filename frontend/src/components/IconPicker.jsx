import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  // Food & Dining
  Utensils, Coffee, Pizza, Wine, Soup,
  // Transportation
  Car, Fuel, Train, Plane, Bike,
  // Home & Utilities
  Home, Lightbulb, Wifi, Smartphone, Tv,
  // Shopping
  ShoppingBag, ShoppingCart, Gift, Shirt,
  // Health & Fitness
  Heart, Activity, Dumbbell, Pill,
  // Work & Finance
  Briefcase, TrendingUp, DollarSign, CreditCard, Wallet,
  // Entertainment
  Music, Film, Gamepad2, Camera,
  // Education
  BookOpen, GraduationCap, Pencil,
  // Other
  Wrench, PawPrint, Sparkles, Star, Package, Folder, Calendar, Clock,
  // Additional useful icons
  Users, MapPin, Phone, Mail, Bell, Settings, Download, Upload,
  // Search icon
  Search,
} from 'lucide-react';
import { theme } from '../styles/theme';

// Icon catalog with names and components
const ICON_CATALOG = [
  // Food & Dining
  { name: 'Utensils', component: Utensils, keywords: ['food', 'dining', 'eat', 'restaurant'] },
  { name: 'Coffee', component: Coffee, keywords: ['coffee', 'drink', 'cafe', 'beverage'] },
  { name: 'Pizza', component: Pizza, keywords: ['pizza', 'food', 'fast food'] },
  { name: 'Wine', component: Wine, keywords: ['wine', 'alcohol', 'drink', 'bar'] },
  { name: 'Soup', component: Soup, keywords: ['soup', 'food', 'meal'] },

  // Transportation
  { name: 'Car', component: Car, keywords: ['car', 'vehicle', 'transport', 'auto'] },
  { name: 'Fuel', component: Fuel, keywords: ['fuel', 'gas', 'petrol', 'gasoline'] },
  { name: 'Train', component: Train, keywords: ['train', 'railway', 'transport', 'metro'] },
  { name: 'Plane', component: Plane, keywords: ['plane', 'flight', 'travel', 'airport'] },
  { name: 'Bike', component: Bike, keywords: ['bike', 'bicycle', 'cycling'] },

  // Home & Utilities
  { name: 'Home', component: Home, keywords: ['home', 'house', 'rent', 'mortgage'] },
  { name: 'Lightbulb', component: Lightbulb, keywords: ['light', 'electricity', 'utilities', 'power'] },
  { name: 'Wifi', component: Wifi, keywords: ['wifi', 'internet', 'network', 'connection'] },
  { name: 'Smartphone', component: Smartphone, keywords: ['phone', 'mobile', 'smartphone', 'cell'] },
  { name: 'Tv', component: Tv, keywords: ['tv', 'television', 'entertainment', 'streaming'] },

  // Shopping
  { name: 'ShoppingBag', component: ShoppingBag, keywords: ['shopping', 'bag', 'retail', 'store'] },
  { name: 'ShoppingCart', component: ShoppingCart, keywords: ['cart', 'shopping', 'groceries', 'supermarket'] },
  { name: 'Gift', component: Gift, keywords: ['gift', 'present', 'celebration'] },
  { name: 'Shirt', component: Shirt, keywords: ['shirt', 'clothing', 'apparel', 'fashion'] },

  // Health & Fitness
  { name: 'Heart', component: Heart, keywords: ['heart', 'health', 'medical', 'wellness'] },
  { name: 'Activity', component: Activity, keywords: ['activity', 'fitness', 'exercise', 'health'] },
  { name: 'Dumbbell', component: Dumbbell, keywords: ['dumbbell', 'gym', 'fitness', 'workout'] },
  { name: 'Pill', component: Pill, keywords: ['pill', 'medicine', 'medication', 'pharmacy'] },

  // Work & Finance
  { name: 'Briefcase', component: Briefcase, keywords: ['briefcase', 'work', 'business', 'office'] },
  { name: 'TrendingUp', component: TrendingUp, keywords: ['trending', 'growth', 'investment', 'stock'] },
  { name: 'DollarSign', component: DollarSign, keywords: ['dollar', 'money', 'currency', 'finance'] },
  { name: 'CreditCard', component: CreditCard, keywords: ['credit card', 'payment', 'card', 'banking'] },
  { name: 'Wallet', component: Wallet, keywords: ['wallet', 'money', 'cash', 'finance'] },

  // Entertainment
  { name: 'Music', component: Music, keywords: ['music', 'audio', 'song', 'entertainment'] },
  { name: 'Film', component: Film, keywords: ['film', 'movie', 'cinema', 'entertainment'] },
  { name: 'Gamepad2', component: Gamepad2, keywords: ['gamepad', 'gaming', 'game', 'entertainment'] },
  { name: 'Camera', component: Camera, keywords: ['camera', 'photo', 'photography'] },

  // Education
  { name: 'BookOpen', component: BookOpen, keywords: ['book', 'education', 'learning', 'school'] },
  { name: 'GraduationCap', component: GraduationCap, keywords: ['graduation', 'education', 'university', 'school'] },
  { name: 'Pencil', component: Pencil, keywords: ['pencil', 'write', 'education', 'school'] },

  // Other
  { name: 'Wrench', component: Wrench, keywords: ['wrench', 'tool', 'maintenance', 'repair'] },
  { name: 'PawPrint', component: PawPrint, keywords: ['paw', 'pet', 'animal', 'dog', 'cat'] },
  { name: 'Sparkles', component: Sparkles, keywords: ['sparkles', 'magic', 'special', 'premium'] },
  { name: 'Star', component: Star, keywords: ['star', 'favorite', 'important', 'premium'] },
  { name: 'Package', component: Package, keywords: ['package', 'box', 'delivery', 'shipping'] },
  { name: 'Folder', component: Folder, keywords: ['folder', 'file', 'documents', 'storage'] },
  { name: 'Calendar', component: Calendar, keywords: ['calendar', 'date', 'schedule', 'appointment'] },
  { name: 'Clock', component: Clock, keywords: ['clock', 'time', 'schedule'] },
  { name: 'Users', component: Users, keywords: ['users', 'people', 'group', 'team'] },
  { name: 'MapPin', component: MapPin, keywords: ['map', 'location', 'pin', 'place'] },
  { name: 'Phone', component: Phone, keywords: ['phone', 'call', 'telephone'] },
  { name: 'Mail', component: Mail, keywords: ['mail', 'email', 'message'] },
  { name: 'Bell', component: Bell, keywords: ['bell', 'notification', 'alert'] },
  { name: 'Settings', component: Settings, keywords: ['settings', 'config', 'options'] },
  { name: 'Download', component: Download, keywords: ['download', 'save', 'get'] },
  { name: 'Upload', component: Upload, keywords: ['upload', 'send', 'share'] },
];

const IconPicker = ({ isOpen, onClose, onSelectIcon, selectedIcon }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredIcons, setFilteredIcons] = useState(ICON_CATALOG);
  const pickerRef = useRef(null);

  // Filter icons based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredIcons(ICON_CATALOG);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = ICON_CATALOG.filter(
        (icon) =>
          icon.name.toLowerCase().includes(query) ||
          icon.keywords.some((keyword) => keyword.includes(query))
      );
      setFilteredIcons(filtered);
    }
  }, [searchQuery]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle icon selection
  const handleIconClick = (iconComponent) => {
    onSelectIcon(iconComponent);
    onClose();
  };

  // Check if an icon is selected
  const isIconSelected = (iconComponent) => {
    return selectedIcon === iconComponent;
  };

  if (!isOpen) return null;

  return (
    // Overlay
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: theme.zIndex.modal + 1,
        padding: theme.spacing[4],
      }}
    >
      {/* Picker Content */}
      <div
        ref={pickerRef}
        style={{
          backgroundColor: theme.colors.background.card,
          borderRadius: theme.border.radius.xl,
          maxWidth: '500px',
          width: '100%',
          maxHeight: '600px',
          boxShadow: theme.shadows.xl,
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: theme.spacing[6],
            borderBottom: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.light}`,
          }}
        >
          <h2
            style={{
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              margin: 0,
              marginBottom: theme.spacing[4],
            }}
          >
            Select Icon
          </h2>

          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search icons..."
              style={{
                width: '100%',
                padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
                paddingRight: theme.spacing[10],
                border: `${theme.border.width.thin} ${theme.border.style.solid} ${theme.colors.border.medium}`,
                borderRadius: theme.border.radius.base,
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.text.primary,
                backgroundColor: theme.colors.background.card,
              }}
            />
            <Search
              size={20}
              style={{
                position: 'absolute',
                right: theme.spacing[3],
                top: '50%',
                transform: 'translateY(-50%)',
                color: theme.colors.text.secondary,
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        {/* Icon Grid */}
        <div
          style={{
            padding: theme.spacing[6],
            overflowY: 'auto',
            flex: 1,
          }}
        >
          {filteredIcons.length > 0 ? (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: theme.spacing[2],
              }}
            >
              {filteredIcons.map((icon) => {
                const IconComponent = icon.component;
                const selected = isIconSelected(IconComponent);
                return (
                  <button
                    key={icon.name}
                    onClick={() => handleIconClick(IconComponent)}
                    style={{
                      padding: theme.spacing[3],
                      borderRadius: theme.border.radius.base,
                      backgroundColor: selected
                        ? theme.colors.background.cardHover
                        : 'transparent',
                      border: selected
                        ? `${theme.border.width.medium} ${theme.border.style.solid} ${theme.colors.text.primary}`
                        : `${theme.border.width.thin} ${theme.border.style.solid} transparent`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: theme.transitions.fast,
                      aspectRatio: '1',
                    }}
                    onMouseEnter={(e) => {
                      if (!selected) {
                        e.currentTarget.style.backgroundColor = theme.colors.background.cardHover;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selected) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                    title={icon.name}
                  >
                    <IconComponent size={25} color={theme.colors.text.primary} />
                  </button>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: theme.spacing[8],
                color: theme.colors.text.secondary,
              }}
            >
              <p style={{ margin: 0 }}>No icons found for "{searchQuery}"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

IconPicker.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSelectIcon: PropTypes.func.isRequired,
  selectedIcon: PropTypes.any,
};

export default IconPicker;
