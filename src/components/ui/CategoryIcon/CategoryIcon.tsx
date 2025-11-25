import {
    Briefcase,
    Building,
    Car,
    CreditCard,
    Film,
    Gift,
    GraduationCap,
    Heart,
    HeartPulse,
    Home,
    Laptop,
    type LucideIcon,
    MoreHorizontal,
    Plane,
    PlusCircle,
    ShoppingBag,
    Sparkles,
    TrendingUp,
    Utensils,
    Zap,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  utensils: Utensils,
  car: Car,
  'shopping-bag': ShoppingBag,
  film: Film,
  zap: Zap,
  'heart-pulse': HeartPulse,
  heart: Heart,
  home: Home,
  plane: Plane,
  'graduation-cap': GraduationCap,
  sparkles: Sparkles,
  'more-horizontal': MoreHorizontal,
  briefcase: Briefcase,
  laptop: Laptop,
  'trending-up': TrendingUp,
  gift: Gift,
  building: Building,
  'plus-circle': PlusCircle,
  'credit-card': CreditCard,
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
