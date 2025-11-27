import {
  AppWindow,
  Armchair,
  Award,
  Baby,
  BadgePercent,
  Bed,
  Bike,
  Blocks,
  BookMarked,
  BookOpen,
  Briefcase,
  Building,
  Building2,
  Car,
  CarFront,
  ChartLine,
  Clock,
  Coffee,
  CreditCard,
  Droplet,
  Dumbbell,
  Eye,
  Film,
  Flame,
  Fuel,
  Gamepad2,
  Gift,
  GraduationCap,
  Heart,
  HeartHandshake,
  HeartPulse,
  Home,
  Landmark,
  Laptop,
  type LucideIcon,
  Map,
  MoreHorizontal,
  Music,
  Palette,
  PawPrint,
  Pencil,
  Percent,
  Pill,
  Plane,
  PlusCircle,
  Receipt,
  Repeat,
  Rocket,
  Shield,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Smile,
  Sparkles,
  SquareParking,
  Stethoscope,
  Store,
  Tag,
  Ticket,
  TrainFront,
  TrendingUp,
  Tv,
  Undo2,
  Users,
  Utensils,
  Wifi,
  Wrench,
  Zap,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  // Food & Dining
  'shopping-cart': ShoppingCart,
  utensils: Utensils,
  coffee: Coffee,
  bike: Bike,
  
  // Housing & Utilities
  home: Home,
  landmark: Landmark,
  zap: Zap,
  droplet: Droplet,
  flame: Flame,
  wifi: Wifi,
  smartphone: Smartphone,
  wrench: Wrench,
  
  // Transportation
  fuel: Fuel,
  'train-front': TrainFront,
  car: Car,
  'square-parking': SquareParking,
  'car-front': CarFront,
  shield: Shield,
  
  // Shopping
  shirt: Shirt,
  laptop: Laptop,
  armchair: Armchair,
  sparkles: Sparkles,
  gift: Gift,
  'shopping-bag': ShoppingBag,
  
  // Entertainment
  film: Film,
  tv: Tv,
  'gamepad-2': Gamepad2,
  'book-open': BookOpen,
  palette: Palette,
  dumbbell: Dumbbell,
  ticket: Ticket,
  
  // Travel
  plane: Plane,
  bed: Bed,
  map: Map,
  
  // Health
  stethoscope: Stethoscope,
  pill: Pill,
  'heart-pulse': HeartPulse,
  smile: Smile,
  eye: Eye,
  heart: Heart,
  
  // Education
  'graduation-cap': GraduationCap,
  'book-marked': BookMarked,
  pencil: Pencil,
  
  // Financial
  'building-2': Building2,
  'credit-card': CreditCard,
  receipt: Receipt,
  
  // Family & Kids
  baby: Baby,
  blocks: Blocks,
  'paw-print': PawPrint,
  
  // Subscriptions
  repeat: Repeat,
  'app-window': AppWindow,
  
  // Other
  'heart-handshake': HeartHandshake,
  'more-horizontal': MoreHorizontal,
  
  // Income - Employment
  briefcase: Briefcase,
  award: Award,
  clock: Clock,
  
  // Income - Freelance
  store: Store,
  users: Users,
  rocket: Rocket,
  
  // Income - Investments
  'trending-up': TrendingUp,
  percent: Percent,
  'chart-line': ChartLine,
  building: Building,
  music: Music,
  
  // Income - Other
  'undo-2': Undo2,
  'badge-percent': BadgePercent,
  tag: Tag,
  'plus-circle': PlusCircle,
};

interface CategoryIconProps {
  icon: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const CategoryIcon = ({ icon, color, size = 'md', className }: CategoryIconProps) => {
  const IconComponent = iconMap[icon];
  
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (!IconComponent) {
    // Fallback for emoji or unknown icons
    return <span className={className}>{icon}</span>;
  }

  return (
    <IconComponent 
      className={`${sizeClasses[size]} ${className || ''}`} 
      style={color ? { color } : undefined}
    />
  );
};
