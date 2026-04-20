import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { UserProfile, LinkItem, THEMES, Theme, SOCIAL_PLATFORMS } from '../types';
import { 
  Globe, Share2, AlertCircle, Loader2,
  Instagram, Twitter, Facebook, Linkedin, Youtube, Github, Music2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!username) return;

    const fetchUser = async () => {
      try {
        // Find user by username
        const usernameRef = doc(db, 'usernames', username.toLowerCase());
        const usernameSnap = await getDoc(usernameRef);
        
        if (!usernameSnap.exists()) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const userId = usernameSnap.data().userId;
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const profileData = userSnap.data() as UserProfile;
          setProfile(profileData);

          // Real-time links
          const q = query(collection(db, 'users', userId, 'links'), orderBy('order', 'asc'));
          const unsubscribe = onSnapshot(q, (snapshot) => {
            const allLinks = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LinkItem));
            setLinks(allLinks.filter(l => l.isVisible));
          });

          // Log analytics
          await addDoc(collection(db, 'users', userId, 'analytics'), {
            timestamp: new Date().toISOString(),
            path: `/${username}`,
            device: /iPhone|Android/.test(navigator.userAgent) ? 'mobile' : 'desktop'
          });

          setLoading(false);
          return () => unsubscribe();
        } else {
          setNotFound(true);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        setNotFound(true);
        setLoading(false);
      }
    };

    fetchUser();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-gray-700 mb-6" />
        <h1 className="text-4xl font-black mb-2 uppercase">USER NOT FOUND</h1>
        <p className="text-gray-500 mb-8">The BioVerse alias you're looking for doesn't exist.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-white text-black font-bold rounded-lg uppercase text-xs"
        >
          Create Your Own
        </button>
      </div>
    );
  }

  const theme = THEMES.find(t => t.id === profile.themeId) || THEMES[0];
  const custom = profile.customTheme || {};

  const trackClick = async (linkId: string) => {
    try {
      // Incremental click count logic could be here (server-side preferred)
      console.log('Clicked link:', linkId);
    } catch (err) {
      console.error('Click tracking failed');
    }
  };

  const getButtonShapeClass = (shape?: string) => {
    switch (shape) {
       case 'square': return 'rounded-none';
       case 'rounder': return 'rounded-3xl';
       case 'full': return 'rounded-full';
       case 'round': default: return 'rounded-xl';
    }
  };

  const getButtonShadowClass = (shadow?: string) => {
    switch (shadow) {
       case 'none': return 'shadow-none';
       case 'soft': return 'shadow-sm';
       case 'strong': return 'shadow-xl shadow-black/40';
       case 'hard': return 'shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] transition-all';
       default: return 'shadow-sm hover:shadow-xl';
    }
  };

  const getButtonStyle = (isHover: boolean = false) => {
    const style = custom.buttonStyle || 'solid';
    const bgHex = custom.buttonColor || '#ffffff';
    const textHex = custom.buttonTextColor || '#000000';
    
    if (style === 'solid') return { backgroundColor: bgHex, color: textHex, borderColor: bgHex };
    if (style === 'outline') return { backgroundColor: 'transparent', color: bgHex, borderColor: bgHex, borderWidth: '2px' };
    if (style === 'glass') return { backgroundColor: `${bgHex}20`, color: bgHex, backdropFilter: 'blur(10px)', borderColor: `${bgHex}40`, borderWidth: '1px' };
    
    return {};
  };

  const getPageStyle = () => {
     const style: React.CSSProperties = {};
     if (custom.pageFont) style.fontFamily = `"${custom.pageFont}", sans-serif`;
     if (custom.pageTextColor) style.color = custom.pageTextColor;
     
     if (custom.wallpaperStyle === 'fill' && custom.backgroundColor) {
        style.backgroundColor = custom.backgroundColor;
     } else if (custom.wallpaperStyle === 'gradient') {
        style.backgroundImage = `linear-gradient(to bottom right, ${custom.backgroundColor || '#202020'}, #000000)`;
     }
     
     return style;
  };

  const isCustomBg = Object.keys(custom).length > 0 && !!custom.wallpaperStyle;
  const customPageStyle = Object.keys(custom).length > 0 ? getPageStyle() : {};

  return (
    <div 
      className={cn(
        "min-h-screen transition-colors duration-500",
        !isCustomBg && theme.bg, 
        !isCustomBg && theme.text, 
        !custom.pageFont && theme.font,
        profile.headerLayout === 'hero' && "pt-0"
      )}
      style={{ ...theme.customStyle, ...customPageStyle }}
    >
      {/* Hero Header Layout Background (if active) */}
      {profile.headerLayout === 'hero' && (
        <div className="w-full h-80 relative overflow-hidden mb-[-80px] z-0">
           <img 
              src={profile.avatarUrl} 
              alt={profile.displayName} 
              className="w-full h-full object-cover blur-2xl opacity-60 scale-110"
              referrerPolicy="no-referrer"
            />
            {(!isCustomBg) && <div className={`absolute inset-0 bg-gradient-to-t from-${theme.bg.split('bg-')[1]} to-transparent`} />}
            {(isCustomBg) && <div className={`absolute inset-0 bg-gradient-to-t`} style={{ backgroundImage: `linear-gradient(to top, ${custom.backgroundColor}, transparent)` }} />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <div className={cn(
        "max-w-xl mx-auto px-6 pb-20 flex flex-col items-center relative z-10",
        profile.headerLayout === 'hero' ? 'pt-8' : 'py-20'
      )}>
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 text-center"
        >
          <div className="relative group">
            <img 
              src={profile.avatarUrl} 
              alt={profile.displayName} 
              className={cn(
                "rounded-full border-4 mb-4 object-cover shadow-2xl mx-auto z-10 relative",
                profile.headerLayout === 'hero' ? "w-32 h-32 border-white/20" : "w-24 h-24 border-white/10"
              )}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full scale-0 group-hover:scale-110 transition-transform duration-500 blur-xl -z-10" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{profile.displayName}</h1>
          <p className="text-sm opacity-60 font-mono mt-1 tracking-widest uppercase">@{profile.username}</p>
          {profile.bio && <p className="mt-4 text-sm max-w-xs mx-auto opacity-80 leading-relaxed font-medium">{profile.bio}</p>}

          {/* Social Row */}
          {profile.socials && Object.keys(profile.socials).length > 0 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              {Object.entries(profile.socials).map(([platformId, url]) => {
                if (typeof url !== 'string' || !url) return null;
                const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
                if (!platform) return null;
                return (
                  <a key={platformId} href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noreferrer" className="opacity-70 hover:opacity-100 hover:scale-110 transition-all">
                    {platform.id === 'instagram' && <Instagram size={20} />}
                    {platform.id === 'twitter' && <Twitter size={20} />}
                    {platform.id === 'facebook' && <Facebook size={20} />}
                    {platform.id === 'linkedin' && <Linkedin size={20} />}
                    {platform.id === 'youtube' && <Youtube size={20} />}
                    {platform.id === 'github' && <Github size={20} />}
                    {platform.id === 'tiktok' && <Music2 size={20} />}
                  </a>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Links Grid */}
        <div className="w-full space-y-4">
          {links.map((link, i) => {
            const isSocial = link.type === 'social';
            const isCourse = link.type === 'course';
            const isCalendar = link.type === 'calendar';
            const platform = isSocial ? SOCIAL_PLATFORMS.find(p => p.id === link.platform) : null;
            
            return (
              <motion.a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => trackClick(link.id)}
                className={cn(
                  "flex items-center justify-center gap-3 w-full p-4 font-bold tracking-tight transition-all duration-300",
                  Object.keys(custom).length === 0 && theme.card,
                  Object.keys(custom).length === 0 && "rounded-xl shadow-sm hover:shadow-xl",
                  Object.keys(custom).length > 0 && getButtonShapeClass(custom.buttonRoundness),
                  Object.keys(custom).length > 0 && getButtonShadowClass(custom.buttonShadow),
                  isSocial && "border-2 border-emerald-500/20 text-emerald-100",
                  isCourse && "border-2 border-purple-500/30 text-purple-100",
                  isCalendar && "border-2 border-blue-500/30 text-blue-100"
                )}
                style={Object.keys(custom).length > 0 ? getButtonStyle() : {}}
              >
                {isSocial && platform && (
                   <span className="text-emerald-500">
                    {platform.id === 'instagram' && <Instagram size={18} />}
                    {platform.id === 'twitter' && <Twitter size={18} />}
                    {platform.id === 'facebook' && <Facebook size={18} />}
                    {platform.id === 'linkedin' && <Linkedin size={18} />}
                    {platform.id === 'youtube' && <Youtube size={18} />}
                    {platform.id === 'github' && <Github size={18} />}
                    {platform.id === 'tiktok' && <Music2 size={18} />}
                  </span>
                )}
                {isCourse && <span className="text-xl">🎓</span>}
                {isCalendar && <span className="text-xl">📅</span>}
                
                <span className="flex-1 text-center truncate">{link.title}</span>
                
                {isCourse && link.price && (
                  <span className="text-xs px-2 py-1 bg-black/40 rounded-md text-white font-mono shrink-0">
                    {link.price}
                  </span>
                )}
              </motion.a>
            );
          })}
        </div>

        {/* Branding Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-20 flex flex-col items-center gap-4"
        >
           <div className="flex items-center gap-2 opacity-30 hover:opacity-100 transition-opacity cursor-default">
              <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center">
                <Globe className="w-3.5 h-3.5 text-black" />
              </div>
              <span className="text-[10px] font-mono font-bold tracking-[0.2em] uppercase">Built by BioVerse</span>
           </div>
           
           <button 
            onClick={() => {
              navigator.share({
                title: profile.displayName,
                url: window.location.href
              }).catch(() => {
                navigator.clipboard.writeText(window.location.href);
                alert('URL copied to clipboard!');
              });
            }}
            className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all opacity-50 hover:opacity-100"
           >
              <Share2 className="w-4 h-4" />
           </button>
        </motion.div>
      </div>
    </div>
  );
}
