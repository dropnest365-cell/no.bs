import {
  Laptop, Mic, ShoppingCart, Package, GraduationCap, Megaphone, PenTool, Camera, Briefcase,
  UtensilsCrossed, Wrench, Car, Store, PawPrint, Truck, Scissors, Sun, Sofa, HeartPulse, Tag,
  type LucideIcon,
} from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  Laptop, Mic, ShoppingCart, Package, GraduationCap, Megaphone, PenTool, Camera, Briefcase,
  UtensilsCrossed, Wrench, Car, Store, PawPrint, Truck, Scissors, Sun, Sofa, HeartPulse, Tag,
};

const bySlug: Record<string, string> = {
  'digital-services': 'Laptop',
  'content-media': 'Mic',
  ecommerce: 'ShoppingCart',
  'digital-products': 'Package',
  education: 'GraduationCap',
  marketing: 'Megaphone',
  design: 'PenTool',
  creative: 'Camera',
  'professional-services': 'Briefcase',
  'food-beverage': 'UtensilsCrossed',
  'local-services': 'Wrench',
  'auto-services': 'Car',
  retail: 'Store',
  'pet-services': 'PawPrint',
  logistics: 'Truck',
  beauty: 'Scissors',
  'energy-services': 'Sun',
  'home-services': 'Sofa',
  'health-wellness': 'HeartPulse',
};

export const CATEGORY_ICON_NAMES = Object.keys(icons);

export function CategoryIcon({ name, slug, className }: { name?: string | null; slug?: string | null; className?: string }) {
  const resolved = name || (slug ? bySlug[slug] : undefined);
  const Icon = (resolved && icons[resolved]) || Tag;
  return <Icon className={className} aria-hidden="true" />;
}
