export interface UserProfile {
  userId: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  themeId: string;
  isPremium: boolean;
  createdAt: string;
  socials?: Record<string, string>;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  order: number;
  isVisible: boolean;
  clickCount: number;
  type?: 'standard' | 'social';
  platform?: string;
}

export interface SocialPlatform {
  id: string;
  name: string;
  icon: string;
  baseUrl: string;
}

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { id: 'instagram', name: 'Instagram', icon: 'Instagram', baseUrl: 'https://instagram.com/' },
  { id: 'twitter', name: 'Twitter / X', icon: 'Twitter', baseUrl: 'https://x.com/' },
  { id: 'facebook', name: 'Facebook', icon: 'Facebook', baseUrl: 'https://facebook.com/' },
  { id: 'linkedin', name: 'LinkedIn', icon: 'Linkedin', baseUrl: 'https://linkedin.com/in/' },
  { id: 'tiktok', name: 'TikTok', icon: 'Music2', baseUrl: 'https://tiktok.com/@' },
  { id: 'youtube', name: 'YouTube', icon: 'Youtube', baseUrl: 'https://youtube.com/@' },
  { id: 'github', name: 'GitHub', icon: 'Github', baseUrl: 'https://github.com/' }
];

export interface Theme {
  id: string;
  name: string;
  bg: string;
  card: string;
  text: string;
  accent: string;
  font: string;
}

export const THEMES: Theme[] = [
  {
    id: 'minimal-light',
    name: 'Minimal Light',
    bg: 'bg-[#F9FAFB]',
    card: 'bg-white border border-gray-100',
    text: 'text-gray-900',
    accent: 'bg-black text-white',
    font: 'font-sans'
  },
  {
    id: 'bioverse-dark',
    name: 'BioVerse Dark',
    bg: 'bg-[#0A0A0A]',
    card: 'bg-[#141414] border border-white/5',
    text: 'text-white',
    accent: 'bg-emerald-500 text-black',
    font: 'font-sans'
  },
  {
    id: 'sunset-gradient',
    name: 'Sunset Glow',
    bg: 'bg-gradient-to-br from-orange-500 to-pink-600',
    card: 'bg-white/10 backdrop-blur-md border border-white/20',
    text: 'text-white',
    accent: 'bg-white text-orange-600 font-bold',
    font: 'font-sans'
  }
];
