import React from 'react';

export interface CustomTheme {
  buttonStyle?: 'solid' | 'glass' | 'outline';
  buttonRoundness?: 'square' | 'round' | 'rounder' | 'full';
  buttonShadow?: 'none' | 'soft' | 'strong' | 'hard';
  buttonColor?: string;
  buttonTextColor?: string;
  pageFont?: string;
  pageTextColor?: string;
  titleFont?: string;
  titleColor?: string;
  wallpaperStyle?: 'fill' | 'gradient' | 'blur' | 'pattern' | 'image' | 'video';
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
}

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
  goal?: string;
  headerLayout?: 'standard' | 'hero';
  customTheme?: CustomTheme;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  icon?: string;
  order: number;
  isVisible: boolean;
  clickCount: number;
  type?: 'standard' | 'social' | 'course' | 'calendar';
  platform?: string; // used for social, course provider, etc.
  price?: string; // used for course
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
  category: 'Flat' | 'Gradient' | 'Abstract' | 'Glass';
  bg: string;
  card: string;
  text: string;
  accent: string;
  font: string;
  customStyle?: React.CSSProperties;
}

export const THEMES: Theme[] = [
  // GLASS THEMES (NEW - Pinterest Style)
  {
    id: 'glass-studio',
    name: 'Studio Glass',
    category: 'Glass',
    bg: 'bg-[#0f172a]',
    customStyle: {
      backgroundImage: 'radial-gradient(circle at top left, #1e293b 0%, #020617 100%)'
    },
    card: 'bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]',
    text: 'text-white',
    accent: 'bg-white text-black font-bold rounded-full',
    font: 'font-sans'
  },
  {
    id: 'glass-fitness',
    name: 'Pulse Glass',
    category: 'Glass',
    bg: 'bg-[#001730]',
    customStyle: {
      backgroundImage: 'radial-gradient(circle at 50% 0%, #004d99 0%, #000c1a 100%)'
    },
    card: 'bg-[#002855]/30 backdrop-blur-xl border border-[#00509e]/30 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]',
    text: 'text-blue-50',
    accent: 'bg-blue-500 text-white font-bold rounded-full',
    font: 'font-sans'
  },
  {
    id: 'glass-aurora',
    name: 'Aurora Glass',
    category: 'Glass',
    bg: 'bg-[#050510]',
    customStyle: {
      backgroundImage: 'radial-gradient(circle at top right, #3b0764 0%, #050510 50%, #064e3b 100%)'
    },
    card: 'bg-white/5 backdrop-blur-2xl border border-white/20 shadow-[-10px_10px_30px_rgba(255,255,255,0.05)] text-left',
    text: 'text-white',
    accent: 'bg-emerald-400 text-black font-bold rounded-full',
    font: 'font-sans'
  },

  // FLAT THEMES
  {
    id: 'bioverse-dark',
    name: 'BioVerse Dark',
    category: 'Flat',
    bg: 'bg-[#0A0A0A]',
    card: 'bg-[#141414] border border-white/5',
    text: 'text-white',
    accent: 'bg-emerald-500 text-black',
    font: 'font-sans'
  },
  {
    id: 'minimal-light',
    name: 'Mineral White',
    category: 'Flat',
    bg: 'bg-[#F9FAFB]',
    card: 'bg-white border border-gray-100 shadow-sm',
    text: 'text-gray-900',
    accent: 'bg-black text-white',
    font: 'font-sans'
  },
  {
    id: 'deep-forest',
    name: 'Deep Forest',
    category: 'Flat',
    bg: 'bg-[#062017]',
    card: 'bg-[#0A2F22] border border-emerald-900/50',
    text: 'text-emerald-50',
    accent: 'bg-emerald-400 text-[#062017]',
    font: 'font-serif'
  },
  {
    id: 'mocha-brown',
    name: 'Mocha',
    category: 'Flat',
    bg: 'bg-[#3E2723]',
    card: 'bg-[#4E342E] border border-orange-900/30',
    text: 'text-orange-50',
    accent: 'bg-orange-300 text-[#3E2723]',
    font: 'font-mono'
  },
  
  // GRADIENT THEMES
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    category: 'Gradient',
    bg: 'bg-gradient-to-br from-orange-400 via-rose-500 to-purple-600',
    card: 'bg-white/10 backdrop-blur-md border border-white/20',
    text: 'text-white',
    accent: 'bg-white text-rose-600 font-bold',
    font: 'font-sans'
  },
  {
    id: 'nordic-ice',
    name: 'Nordic Ice',
    category: 'Gradient',
    bg: 'bg-gradient-to-t from-[#e0c3fc] to-[#8ec5fc]',
    card: 'bg-white/40 backdrop-blur-md border border-white/40',
    text: 'text-slate-800',
    accent: 'bg-slate-800 text-white',
    font: 'font-sans'
  },
  {
    id: 'midnight-purple',
    name: 'Midnight',
    category: 'Gradient',
    bg: 'bg-gradient-to-bl from-indigo-900 via-purple-900 to-black',
    card: 'bg-white/5 backdrop-blur-sm border border-white/10',
    text: 'text-purple-50',
    accent: 'bg-purple-400 text-black',
    font: 'font-sans'
  },

  // ABSTRACT THEMES
  {
    id: 'purple-blobs',
    name: 'Purple Blobs',
    category: 'Abstract',
    bg: 'bg-[#8B5CF6]', // Fallback
    customStyle: {
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='blobs' x='0' y='0' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Cpath d='M25,50 C25,25 50,25 50,50 C50,75 25,75 25,50 Z' fill='rgba(0,0,0,0.1)'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='%238B5CF6'/%3E%3Crect width='100%25' height='100%25' fill='url(%23blobs)'/%3E%3C/svg%3E")`
    },
    card: 'bg-white/20 backdrop-blur-lg border border-white/30',
    text: 'text-white',
    accent: 'bg-white text-purple-600',
    font: 'font-serif'
  },
  {
    id: 'retro-grid',
    name: 'Retro Grid',
    category: 'Abstract',
    bg: 'bg-[#2E1026]',
    customStyle: {
      backgroundImage: `linear-gradient(rgba(255,100,100,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,100,100,0.1) 1px, transparent 1px)`,
      backgroundSize: '30px 30px'
    },
    card: 'bg-[#401635] border border-rose-900/50',
    text: 'text-rose-50',
    accent: 'bg-rose-400 text-black',
    font: 'font-mono'
  },
  {
    id: 'soft-waves',
    name: 'Soft Waves',
    category: 'Abstract',
    bg: 'bg-[#d5d4d0]',
    customStyle: {
      backgroundImage: `linear-gradient(135deg, #d5d4d0 0%, #d5d4d0 15%, #eeeeec 15%, #eeeeec 50%, #d5d4d0 50%, #d5d4d0 65%, #eeeeec 65%, #eeeeec 100%)`,
      backgroundSize: '40px 40px'
    },
    card: 'bg-white border border-gray-200 shadow-xl',
    text: 'text-gray-900',
    accent: 'bg-gray-900 text-white',
    font: 'font-sans'
  }
];
