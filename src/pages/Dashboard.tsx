import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { LinkItem, UserProfile, THEMES, SOCIAL_PLATFORMS } from '../types';
import { 
  Plus, GripVertical, Trash2, ExternalLink, Settings, BarChart2, 
  Palette, LogOut, Loader2, Check, Layout, Save, Globe, Share2,
  Instagram, Twitter, Facebook, Linkedin, Youtube, Github, Music2,
  Zap, Upload, Image as ImageIcon, Video
} from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

// Sortable Item Component
function SortableLink({ link, onUpdate, onDelete }: { key?: string, link: LinkItem, onUpdate: (id: string, data: Partial<LinkItem>) => void, onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 0 };

  const IconComponent = () => {
    if (link.type === 'course') return <span className="text-lg leading-none select-none">🎓</span>;
    if (link.type === 'calendar') return <span className="text-lg leading-none select-none">📅</span>;
    if (link.type === 'social' && link.platform) {
      const platform = SOCIAL_PLATFORMS.find(p => p.id === link.platform);
      if (platform) {
        switch (platform.icon) {
          case 'Instagram': return <Instagram className="w-4 h-4" />;
          case 'Twitter': return <Twitter className="w-4 h-4" />;
          case 'Facebook': return <Facebook className="w-4 h-4" />;
          case 'Linkedin': return <Linkedin className="w-4 h-4" />;
          case 'Youtube': return <Youtube className="w-4 h-4" />;
          case 'Github': return <Github className="w-4 h-4" />;
          case 'Music2': return <Music2 className="w-4 h-4" />;
        }
      }
    }
    return <Globe className="w-4 h-4" />;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center gap-3 p-4 bg-[#141414] border border-white/5 rounded-xl transition-all ${isDragging ? 'shadow-2xl border-emerald-500/50 scale-[1.02]' : 'hover:border-white/20'}`}
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-white transition-colors">
        <GripVertical className="w-5 h-5" />
      </button>

      <div className={`p-2 rounded-lg flex items-center justify-center w-10 h-10 shrink-0 ${link.type === 'course' ? 'bg-purple-500/10 text-purple-400' : link.type === 'calendar' ? 'bg-blue-500/10 text-blue-400' : 'bg-white/5 text-emerald-500'}`}>
        <IconComponent />
      </div>
      
      <div className="flex-1 space-y-1">
        <div className="flex gap-2 items-center">
          <input 
            type="text" 
            defaultValue={link.title}
            onBlur={(e) => onUpdate(link.id, { title: e.target.value })}
            className="flex-1 bg-transparent font-bold text-sm focus:outline-none placeholder:text-gray-700"
            placeholder={link.type === 'social' ? 'Platform Name' : link.type === 'course' ? 'Course Title' : link.type === 'calendar' ? 'Booking Title' : 'Link Title'}
          />
          {link.type === 'social' && (
            <select
              value={link.platform || ''}
              onChange={(e) => {
                const p = SOCIAL_PLATFORMS.find(sp => sp.id === e.target.value);
                if (p) {
                  onUpdate(link.id, { 
                    platform: p.id, 
                    title: p.name,
                    url: link.url || p.baseUrl
                  });
                }
              }}
              className="bg-black/50 text-[10px] text-gray-400 border border-white/5 rounded px-1 focus:outline-none"
            >
              <option value="">Select Platform</option>
              {SOCIAL_PLATFORMS.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          {link.type === 'course' && (
             <div className="flex items-center gap-1">
               <span className="text-[10px] text-gray-500">$</span>
               <input 
                  type="text" 
                  defaultValue={link.price}
                  onBlur={(e) => onUpdate(link.id, { price: e.target.value })}
                  className="w-12 bg-black/50 text-[10px] text-white border border-white/5 rounded px-1 py-0.5 focus:outline-none text-right font-mono font-bold"
                  placeholder="Price"
               />
             </div>
          )}
        </div>
        <input 
          type="text" 
          defaultValue={link.url}
          onBlur={(e) => onUpdate(link.id, { url: e.target.value })}
          className="w-full bg-transparent text-xs focus:outline-none text-gray-500 focus:text-white transition-colors"
          placeholder={link.type === 'social' ? 'username or profile URL' : link.type === 'calendar' ? 'e.g. cal.com/username' : link.type === 'course' ? 'Checkout URL' : 'https://example.com'}
        />
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
         <button 
          onClick={() => onUpdate(link.id, { isVisible: !link.isVisible })}
          className={`p-2 rounded-lg transition-colors ${link.isVisible ? 'text-emerald-500 bg-emerald-500/10' : 'text-gray-500 bg-white/5'}`}
        >
          <Check className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onDelete(link.id)}
          className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [activeTab, setActiveTab] = useState<'links' | 'appearance' | 'analytics'>('links');
  const [isAdding, setIsAdding] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    bio: '',
    avatarUrl: '',
    socials: {} as Record<string, string>,
    headerLayout: 'standard' as 'standard' | 'hero',
    customTheme: {} as any
  });

  useEffect(() => {
    if (profile) {
      setProfileForm({
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        avatarUrl: profile.avatarUrl || '',
        socials: profile.socials || {},
        headerLayout: profile.headerLayout || 'standard',
        customTheme: profile.customTheme || {}
      });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: profileForm.displayName,
        bio: profileForm.bio,
        avatarUrl: profileForm.avatarUrl,
        socials: profileForm.socials,
        headerLayout: profileForm.headerLayout,
        customTheme: profileForm.customTheme
      });
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setSaving(false), 500); // give a little time so they see it saved
    }
  };

  const seedProfile = async () => {
    if (!user || !profile) return;
    setIsSeeding(true);
    try {
      const demoLinks = [
        { id: 'demo-1', title: 'Personal Website', url: 'https://example.com', order: 0, isVisible: true, clickCount: 120 },
        { id: 'demo-2', title: 'LinkedIn Profile', url: 'https://linkedin.com', order: 1, isVisible: true, clickCount: 85 },
        { id: 'demo-3', title: 'My Digital Store', url: 'https://lemonsqueezy.com', order: 2, isVisible: true, clickCount: 432 },
        { id: 'demo-4', title: 'Newsletter Signup', url: 'https://substack.com', order: 3, isVisible: true, clickCount: 67 }
      ];

      for (const link of demoLinks) {
        await setDoc(doc(db, 'users', user.uid, 'links', link.id), link);
      }

      await updateDoc(doc(db, 'users', user.uid), {
        bio: 'Helping entrepreneurs build scalable digital products. Expert in AI & SaaS.',
        themeId: 'bioverse-dark'
      });
      alert('Demo profile seeded successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to seed profile.');
    } finally {
      setIsSeeding(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!loading && !user) navigate('/');
    if (!loading && user && !profile) navigate('/setup');
  }, [user, profile, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.uid, 'links'), orderBy('order', 'asc'));
    return onSnapshot(q, (snapshot) => {
      setLinks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LinkItem)));
    });
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File too large. Max 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setProfileForm(prev => ({ ...prev, avatarUrl: dataUrl }));
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const addLink = async (type: 'standard' | 'social' | 'course' | 'calendar' = 'standard') => {
    if (!user) return;
    setIsAdding(true);
    try {
      const newLinkRef = doc(collection(db, 'users', user.uid, 'links'));
      
      let title = 'New Link';
      if (type === 'social') title = 'New Social Link';
      if (type === 'course') title = 'New Course';
      if (type === 'calendar') title = 'New Booking';

      const linkData: any = {
        id: newLinkRef.id,
        title,
        url: '',
        isVisible: true,
        order: links.length,
        clickCount: 0,
        type: type
      };

      if (type === 'course') {
        linkData.price = '$99';
        linkData.platform = 'kajabi';
      }
      if (type === 'calendar') {
        linkData.platform = 'cal';
        linkData.url = 'https://cal.com/your-username';
      }

      await setDoc(newLinkRef, linkData);
    } finally {
      setIsAdding(false);
    }
  };

  const updateLink = async (id: string, data: Partial<LinkItem>) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid, 'links', id), data);
  };

  const deleteLink = async (id: string) => {
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid, 'links', id));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    // @ts-ignore
    if (active && over && active.id !== over.id) {
      // @ts-ignore
      const oldIndex = links.findIndex(l => l.id === active.id);
      // @ts-ignore
      const newIndex = links.findIndex(l => l.id === over.id);
      const newArray = arrayMove(links, oldIndex, newIndex);
      
      // Update DB
      newArray.forEach((link: any, index) => {
        updateLink(link.id, { order: index });
      });
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    setSaving(true);
    await updateDoc(doc(db, 'users', user.uid), data);
    setSaving(false);
  };

  if (loading || !profile) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col md:flex-row h-screen">
      {/* Sidebar Nav */}
      <aside className="w-full md:w-64 border-r border-white/5 p-6 flex flex-col gap-8">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-emerald-500 rounded-lg" />
           <span className="font-bold tracking-tighter uppercase">BioVerse</span>
        </div>

        <nav className="flex flex-col gap-2">
          {[
            { id: 'links', icon: Layout, label: 'Links' },
            { id: 'appearance', icon: Palette, label: 'Appearance' },
            { id: 'analytics', icon: BarChart2, label: 'Analytics' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="p-4 bg-white/5 rounded-xl border border-white/5">
             <div className="flex items-center gap-3 mb-2">
                <img src={profile.avatarUrl} className="w-8 h-8 rounded-full bg-gray-800" referrerPolicy="no-referrer" />
                <div className="text-[10px] font-mono leading-tight">
                  <p className="text-gray-400 uppercase">Signed in as</p>
                  <p className="text-white">@{profile.username}</p>
                </div>
             </div>
             <button 
              onClick={() => auth.signOut()}
              className="w-full mt-2 py-2 flex items-center justify-center gap-2 text-[10px] border border-white/10 hover:border-red-500/50 hover:text-red-500 transition-all uppercase font-bold"
             >
                <LogOut className="w-3 h-3" /> Sign Out
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 border-r border-white/5">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex justify-between items-end">
             <div>
                <h2 className="text-3xl font-black tracking-tight uppercase">{activeTab}</h2>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-gray-500 text-sm">bioverse.app/{profile.username}</p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`https://bioverse.app/${profile.username}`);
                      alert('Link copied to clipboard!');
                    }}
                    className="text-[10px] uppercase font-bold text-gray-500 border border-gray-800 px-2 py-1 rounded hover:text-white hover:border-gray-500 transition-all"
                  >
                    Copy Link
                  </button>
                </div>
             </div>
             <a 
              href={`/${profile.username}`} 
              target="_blank" 
              className="flex items-center gap-2 text-xs font-mono text-emerald-500 hover:text-emerald-400 transition-colors uppercase font-bold group"
             >
               View Live <ExternalLink className="w-3 h-3 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
             </a>
          </div>

          {!profile.isPremium && (
            <div className="bg-gradient-to-r from-gray-900 to-black border border-white/10 p-6 rounded-2xl flex items-center justify-between shadow-2xl">
              <h3 className="text-white font-bold text-lg">Elevate your design with better themes and styles.</h3>
              <button onClick={() => navigate('/setup/plan')} className="px-6 py-2 bg-emerald-500 text-black font-bold text-sm rounded-full flex items-center gap-2 hover:bg-emerald-400 transition-colors whitespace-nowrap">
                <Zap className="w-4 h-4 fill-current" /> Upgrade
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'links' && (
              <motion.div 
                key="links"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <button 
                    onClick={() => addLink('standard')}
                    disabled={isAdding}
                    className="py-4 bg-emerald-500 text-black text-xs font-bold flex flex-col items-center justify-center gap-2 hover:bg-emerald-400 transition-all rounded-xl shadow-lg shadow-emerald-500/10"
                  >
                    {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    STANDARD
                  </button>
                  <button 
                    onClick={() => addLink('social')}
                    disabled={isAdding}
                    className="py-4 bg-white/10 text-white text-xs font-bold flex flex-col items-center justify-center gap-2 hover:bg-white/20 transition-all rounded-xl shadow-lg"
                  >
                    {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Share2 className="w-5 h-5" />}
                    SOCIAL
                  </button>
                  <button 
                    onClick={() => addLink('course')}
                    disabled={isAdding}
                    className="py-4 bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-bold flex flex-col items-center justify-center gap-2 hover:bg-purple-500/30 transition-all rounded-xl shadow-lg"
                  >
                    {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="text-xl">🎓</div>}
                    COURSE
                  </button>
                  <button 
                    onClick={() => addLink('calendar')}
                    disabled={isAdding}
                    className="py-4 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold flex flex-col items-center justify-center gap-2 hover:bg-blue-500/30 transition-all rounded-xl shadow-lg"
                  >
                    {isAdding ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="text-xl">📅</div>}
                    CALENDAR
                  </button>
                </div>

                {links.length === 0 && (
                   <div className="p-8 border border-white/5 bg-white/5 rounded-2xl text-center space-y-4">
                      <p className="text-gray-500 text-sm">Your bio is empty.</p>
                      <button 
                        onClick={seedProfile}
                        disabled={isSeeding}
                        className="px-6 py-2 border border-emerald-500/30 text-emerald-500 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/10 transition-colors"
                      >
                        {isSeeding ? 'Seeding...' : 'Seed Demo Content'}
                      </button>
                   </div>
                )}

                <div className="space-y-4">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={links.map(l => l.id)} strategy={verticalListSortingStrategy}>
                      {links.map(link => (
                        <SortableLink key={link.id} link={link} onUpdate={updateLink} onDelete={deleteLink} />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div 
                key="appearance"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-12"
              >
                {/* Profile Section */}
                <section className="space-y-4">
                   <h3 className="text-xs font-mono text-emerald-500 uppercase tracking-widest font-bold">Profile Info</h3>
                   
                   {/* Profile Image Edit */}
                   <div className="flex items-center gap-4 p-4 border border-white/5 bg-white/5 rounded-xl">
                      <img src={profileForm.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256'} referrerPolicy="no-referrer" className="w-16 h-16 rounded-full object-cover bg-gray-800" />
                      <div>
                        <label className="cursor-pointer px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors text-white font-bold text-xs rounded-full inline-flex items-center gap-2">
                           <Upload className="w-4 h-4" /> Edit Image
                           <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                        <p className="text-[10px] text-gray-500 mt-2">Recommended: 256x256px.</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 uppercase font-bold">Display Name</label>
                        <input 
                          type="text" 
                          value={profileForm.displayName}
                          onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                          className="w-full bg-[#141414] border border-white/5 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-500 uppercase font-bold">Bio / Slogan</label>
                        <input 
                          type="text" 
                          value={profileForm.bio}
                          onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                          className="w-full bg-[#141414] border border-white/5 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500/30"
                        />
                      </div>
                   </div>

                   {/* Header Layout Form */}
                   <h3 className="text-xs font-mono text-emerald-500 uppercase tracking-widest font-bold mt-8">Header Layout</h3>
                   <div className="grid grid-cols-2 gap-4">
                     <button
                       onClick={() => setProfileForm({ ...profileForm, headerLayout: 'standard' })}
                       className={`p-4 rounded-xl border-2 text-left ${profileForm.headerLayout === 'standard' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 hover:border-white/20'}`}
                     >
                       <div className="w-10 h-10 rounded-full bg-gray-500 mb-2 mx-auto" />
                       <p className="text-xs font-bold text-center">Standard</p>
                     </button>
                     <button
                       onClick={() => setProfileForm({ ...profileForm, headerLayout: 'hero' })}
                       className={`p-4 rounded-xl border-2 text-left relative overflow-hidden ${profileForm.headerLayout === 'hero' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/5 hover:border-white/20'}`}
                     >
                       <div className="absolute top-0 left-0 w-full h-1/2 bg-gray-500 opacity-20 blur-md" />
                       <div className="w-10 h-10 rounded-full bg-gray-500 mb-2 mx-auto relative z-10" />
                       <p className="text-xs font-bold text-center relative z-10">Hero Header</p>
                     </button>
                   </div>

                   {/* Social Links Form */}
                   <h3 className="text-xs font-mono text-emerald-500 uppercase tracking-widest font-bold mt-8">Social Accounts</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {SOCIAL_PLATFORMS.slice(0, 4).map(platform => (
                        <div key={platform.id} className="space-y-2">
                          <label className="text-[10px] text-gray-500 uppercase font-bold">{platform.name} URL</label>
                          <input 
                            type="text" 
                            value={profileForm.socials[platform.id] || ''}
                            onChange={(e) => setProfileForm({
                              ...profileForm, 
                              socials: { ...profileForm.socials, [platform.id]: e.target.value }
                            })}
                            placeholder={platform.baseUrl}
                            className="w-full bg-[#141414] border border-white/5 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500/30 text-gray-300"
                          />
                        </div>
                      ))}
                   </div>
                   
                   <div className="pt-4">
                     <button
                       onClick={handleSaveProfile}
                       disabled={saving}
                       className="py-3 px-8 bg-emerald-500 text-black font-bold uppercase text-xs tracking-widest rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50"
                     >
                       {saving ? 'Saving...' : 'Save Profile Details'}
                     </button>
                   </div>
                </section>

                {/* Theme Selector */}
                <section className="space-y-8">
                  {['Glass', 'Flat', 'Gradient', 'Abstract'].map(category => (
                    <div key={category} className="space-y-4">
                      <h3 className="text-xs font-mono text-emerald-500 uppercase tracking-widest font-bold">{category} Themes</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {THEMES.filter(t => t.category === category).map(theme => (
                          <button
                            key={theme.id}
                            onClick={() => updateProfile({ themeId: theme.id })}
                            className={`group relative overflow-hidden rounded-xl border-2 transition-all p-4 text-left active:scale-95 ${profile.themeId === theme.id ? 'border-emerald-500 ring-4 ring-emerald-500/10' : 'border-white/5 hover:border-white/20'}`}
                          >
                             <div 
                               className={`w-full aspect-video rounded-lg mb-3 flex items-center justify-center transition-transform group-hover:scale-105 ${theme.bg}`}
                               style={theme.customStyle}
                             >
                                <div className={`w-1/2 h-1/2 rounded shadow-xl ${theme.card}`} />
                             </div>
                             <p className="text-xs font-bold uppercase tracking-tight">{theme.name}</p>
                             {profile.themeId === theme.id && (
                               <div className="absolute top-2 right-2 bg-emerald-500 p-1 rounded-full z-10 shadow-lg">
                                  <Check className="w-3 h-3 text-black" />
                               </div>
                             )}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </section>

                {/* Customization Settings */}
                <section className="space-y-8 bg-black/40 border-t border-white/5 pt-12 pb-8">
                  <div>
                    <h3 className="text-xl font-bold uppercase tracking-tight mb-2">Detailed Customization <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded ml-2">PRO</span></h3>
                    <p className="text-gray-500 text-sm">Fine-tune every aspect of your profile's design.</p>
                  </div>
                  
                  {/* Button Style */}
                  <div className="space-y-4">
                     <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Button Style</h4>
                     <div className="grid grid-cols-3 gap-4">
                        {['solid', 'glass', 'outline'].map(style => (
                          <button 
                            key={style}
                            onClick={() => setProfileForm(p => ({ ...p, customTheme: { ...p.customTheme, buttonStyle: style as any } }))}
                            className={`py-4 rounded-xl border-2 capitalize font-medium text-xs transition-all ${profileForm.customTheme?.buttonStyle === style ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-white/5 hover:border-white/20'}`}
                          >
                             {style}
                          </button>
                        ))}
                     </div>
                  </div>

                  {/* Corner Roundness */}
                  <div className="space-y-4">
                     <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Corner Roundness</h4>
                     <div className="grid grid-cols-4 gap-4">
                        {['square', 'round', 'rounder', 'full'].map(shape => (
                          <button 
                            key={shape}
                            onClick={() => setProfileForm(p => ({ ...p, customTheme: { ...p.customTheme, buttonRoundness: shape as any } }))}
                            className={`py-4 rounded-xl border-2 capitalize font-medium text-xs transition-all ${profileForm.customTheme?.buttonRoundness === shape ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-white/5 hover:border-white/20'}`}
                          >
                             {shape}
                          </button>
                        ))}
                     </div>
                  </div>

                  {/* Button Shadow */}
                  <div className="space-y-4">
                     <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Button Shadow</h4>
                     <div className="grid grid-cols-4 gap-4">
                        {['none', 'soft', 'strong', 'hard'].map(shadow => (
                          <button 
                            key={shadow}
                            onClick={() => setProfileForm(p => ({ ...p, customTheme: { ...p.customTheme, buttonShadow: shadow as any } }))}
                            className={`py-4 rounded-xl border-2 capitalize font-medium text-xs transition-all ${profileForm.customTheme?.buttonShadow === shadow ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-white/5 hover:border-white/20'}`}
                          >
                             {shadow}
                          </button>
                        ))}
                     </div>
                  </div>

                  {/* Colors */}
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Button Color</label>
                       <input 
                         type="color" 
                         value={profileForm.customTheme?.buttonColor || '#ffffff'}
                         onChange={(e) => setProfileForm(p => ({ ...p, customTheme: { ...p.customTheme, buttonColor: e.target.value } }))}
                         className="w-full h-12 bg-transparent rounded cursor-pointer"
                       />
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Button Text Color</label>
                       <input 
                         type="color" 
                         value={profileForm.customTheme?.buttonTextColor || '#000000'}
                         onChange={(e) => setProfileForm(p => ({ ...p, customTheme: { ...p.customTheme, buttonTextColor: e.target.value } }))}
                         className="w-full h-12 bg-transparent rounded cursor-pointer"
                       />
                     </div>
                  </div>

                  {/* Fonts */}
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Page Font</label>
                       <select 
                         value={profileForm.customTheme?.pageFont || 'Inter'}
                         onChange={(e) => setProfileForm(p => ({ ...p, customTheme: { ...p.customTheme, pageFont: e.target.value } }))}
                         className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 outline-none text-sm text-gray-300"
                       >
                         <option value="Inter">Inter</option>
                         <option value="Epilogue">Epilogue</option>
                         <option value="Space Grotesk">Space Grotesk</option>
                       </select>
                     </div>
                     <div className="space-y-2">
                       <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Page Text Color</label>
                       <input 
                         type="color" 
                         value={profileForm.customTheme?.pageTextColor || '#ffffff'}
                         onChange={(e) => setProfileForm(p => ({ ...p, customTheme: { ...p.customTheme, pageTextColor: e.target.value } }))}
                         className="w-full h-12 bg-transparent rounded cursor-pointer"
                       />
                     </div>
                  </div>

                  {/* Wallpaper Style */}
                  <div className="space-y-4">
                     <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Wallpaper Style</h4>
                     <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        {['fill', 'gradient', 'blur', 'pattern', 'image', 'video'].map(bg => (
                          <button 
                            key={bg}
                            onClick={() => setProfileForm(p => ({ ...p, customTheme: { ...p.customTheme, wallpaperStyle: bg as any } }))}
                            className={`py-6 rounded-xl border-2 capitalize font-medium text-[10px] transition-all flex flex-col items-center justify-center gap-2 ${profileForm.customTheme?.wallpaperStyle === bg ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-white/5 hover:border-white/20'}`}
                          >
                             {bg === 'image' && <ImageIcon className="w-5 h-5" />}
                             {bg === 'video' && <Video className="w-5 h-5" />}
                             {(bg !== 'image' && bg !== 'video') && <Palette className="w-5 h-5" />}
                             {bg}
                          </button>
                        ))}
                     </div>
                  </div>
                  
                  <div className="pt-4">
                     <button
                       onClick={handleSaveProfile}
                       disabled={saving}
                       className="py-3 px-8 bg-purple-600 text-white font-bold uppercase text-xs tracking-widest rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 w-full"
                     >
                       {saving ? 'Saving...' : 'Apply Details & Custom Styling'}
                     </button>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                 <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Total Views', value: '1,280', icon: BarChart2 },
                      { label: 'Click Through', value: '42.5%', icon: Check }
                    ].map((stat, i) => (
                      <div key={i} className="p-6 bg-[#141414] border border-white/5 rounded-2xl">
                         <div className="flex items-center gap-2 text-gray-500 text-[10px] uppercase font-bold mb-2">
                           <stat.icon className="w-3 h-3" /> {stat.label}
                         </div>
                         <p className="text-3xl font-black">{stat.value}</p>
                      </div>
                    ))}
                 </div>
                 
                 <div className="p-8 bg-white/5 rounded-2xl border border-white/5 text-center">
                    <p className="text-xs font-mono text-emerald-500 bg-emerald-500/10 inline-block px-3 py-1 rounded-full uppercase font-bold mb-4">Premium Feature</p>
                    <h4 className="text-xl font-bold mb-2">Detailed Analytics</h4>
                    <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">Get insights into devices, geographic distribution, and referral sources.</p>
                    <button className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-emerald-500 transition-colors uppercase text-xs">Upgrade to Premium</button>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Preview Section */}
      <aside className="hidden lg:flex w-[400px] bg-[#050505] p-8 flex-col items-center justify-center sticky top-0 h-screen">
        <div className="w-full max-w-[280px] aspect-[9/19] bg-[#141414] rounded-[3rem] border-[8px] border-[#222] shadow-2xl overflow-hidden relative group">
          {/* Phone Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-[#222] rounded-b-2xl z-20" />
          
          {/* Preview Content */}
          <div 
            className={cn(
              "w-full h-full overflow-y-auto scrollbar-hide flex flex-col items-center relative",
              THEMES.find(t => t.id === profile.themeId)?.bg || 'bg-black',
              THEMES.find(t => t.id === profile.themeId)?.text || 'text-white',
              THEMES.find(t => t.id === profile.themeId)?.font || 'font-sans'
            )}
            style={THEMES.find(t => t.id === profile.themeId)?.customStyle}
          >
            {/* Hero Header Layout Background */}
            {profile.headerLayout === 'hero' && (
              <div className="w-full h-40 absolute top-0 left-0 overflow-hidden z-0">
                <img 
                  src={profile.avatarUrl} 
                  alt="" 
                  className="w-full h-full object-cover blur-xl opacity-60 scale-125"
                  referrerPolicy="no-referrer"
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-${(THEMES.find(t => t.id === profile.themeId)?.bg || 'bg-black').split('bg-')[1] || 'black'} to-transparent`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}

            <div className={cn("text-center w-full relative z-10 px-6", profile.headerLayout === 'hero' ? 'mt-12' : 'mt-14')}>
              <img 
                src={profile.avatarUrl} 
                className={cn(
                  "rounded-full mx-auto mb-3 object-cover shadow-xl", 
                  profile.headerLayout === 'hero' ? 'w-20 h-20 border-2 border-white/20' : 'w-16 h-16 border-2 border-white/10'
                )} 
                referrerPolicy="no-referrer" 
              />
              <h4 className="text-sm font-bold truncate">{profile.displayName}</h4>
              <p className="text-[10px] opacity-60 truncate">@{profile.username}</p>
              
              {/* Social Row Preview */}
              {profile.socials && Object.keys(profile.socials).length > 0 && (
                <div className="flex items-center justify-center gap-3 mt-4">
                  {Object.entries(profile.socials).map(([platformId, url]) => {
                    if (typeof url !== 'string' || !url) return null;
                    const platform = SOCIAL_PLATFORMS.find(p => p.id === platformId);
                    if (!platform) return null;
                    return (
                      <div key={platformId} className="opacity-70">
                        {platform.id === 'instagram' && <Instagram size={14} />}
                        {platform.id === 'twitter' && <Twitter size={14} />}
                        {platform.id === 'facebook' && <Facebook size={14} />}
                        {platform.id === 'linkedin' && <Linkedin size={14} />}
                        {platform.id === 'youtube' && <Youtube size={14} />}
                        {platform.id === 'github' && <Github size={14} />}
                        {platform.id === 'tiktok' && <Music2 size={14} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="w-full mt-6 space-y-2 px-6 relative z-10">
              {links.filter(l => l.isVisible).map(link => {
                const isSocial = link.type === 'social';
                const isCourse = link.type === 'course';
                const isCalendar = link.type === 'calendar';
                const platform = isSocial ? SOCIAL_PLATFORMS.find(p => p.id === link.platform) : null;
                
                return (
                  <div 
                    key={link.id} 
                    className={cn(
                      "w-full p-2.5 rounded-lg text-center text-[10px] font-bold shadow-sm flex items-center justify-center gap-2",
                      THEMES.find(t => t.id === profile.themeId)?.card || 'bg-white/10',
                      isSocial && "border-2 border-emerald-500/20",
                      isCourse && "border-2 border-purple-500/30",
                      isCalendar && "border-2 border-blue-500/30"
                    )}
                  >
                    {isSocial && platform && (
                      <span className="text-emerald-500">
                        {platform.id === 'instagram' && <Instagram size={12} />}
                        {platform.id === 'twitter' && <Twitter size={12} />}
                        {platform.id === 'facebook' && <Facebook size={12} />}
                        {platform.id === 'linkedin' && <Linkedin size={12} />}
                        {platform.id === 'youtube' && <Youtube size={12} />}
                        {platform.id === 'github' && <Github size={12} />}
                        {platform.id === 'tiktok' && <Music2 size={12} />}
                      </span>
                    )}
                    {isCourse && <span className="text-[12px]">🎓</span>}
                    {isCalendar && <span className="text-[12px]">📅</span>}
                    <span className="flex-1 text-center truncate">{link.title || 'Untitled Link'}</span>
                    {isCourse && link.price && <span className="text-[9px] px-1.5 py-0.5 bg-black/30 rounded text-white font-mono">{link.price}</span>}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-auto py-4 flex items-center gap-1 opacity-40">
              <Globe className="w-2.5 h-2.5 text-emerald-500" />
              <span className="text-[8px] font-mono uppercase tracking-[0.2em]">BioVerse</span>
            </div>
          </div>
          
          {/* Overlay Label */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-[8px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Live Preview
          </div>
        </div>
        
        <p className="mt-6 text-[10px] font-mono text-gray-600 uppercase tracking-widest">Preview Mode</p>
      </aside>

      {/* Persistence indicator */}
      {saving && (
        <div className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black text-[10px] font-bold rounded-full shadow-2xl uppercase tracking-widest">
           <Save className="w-3 h-3" /> Saving...
        </div>
      )}
    </div>
  );
}
