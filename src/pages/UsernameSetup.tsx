import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Globe, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { isValidUsername } from '../lib/utils';
import { t } from '../lib/i18n';

// Background image URL for the duotone gradient
const BG_IMAGE_URL = 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=2000&auto=format&fit=crop';

export default function UsernameSetup() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) navigate('/admin');
  }, [profile, navigate]);

  const checkUsername = async (val: string) => {
    if (!isValidUsername(val)) {
      setStatus('invalid');
      return;
    }
    setStatus('checking');
    const docRef = doc(db, 'usernames', val.toLowerCase());
    const docSnap = await getDoc(docRef);
    setStatus(docSnap.exists() ? 'taken' : 'available');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || status !== 'available') return;

    setLoading(true);
    try {
      const lowerUsername = username.toLowerCase();
      // 1. Create username index
      await setDoc(doc(db, 'usernames', lowerUsername), { userId: user.uid });
      // 2. Create user profile
      await setDoc(doc(db, 'users', user.uid), {
        userId: user.uid,
        email: user.email,
        username: lowerUsername,
        displayName: user.displayName || username,
        avatarUrl: user.photoURL || '',
        themeId: 'bioverse-dark',
        headerLayout: 'standard', // Default layout
        isPremium: false,
        createdAt: new Date().toISOString()
      });
      await refreshProfile();
      navigate('/setup/goal');
    } catch (err) {
      setError('Failed to create account. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-6 bg-black">
      {/* Background Image with Duotune Gradient */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BG_IMAGE_URL})` }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-emerald-900/75 to-black/75 backdrop-blur-sm" />

      <div className="relative z-10 max-w-lg w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">{t('setup.username.title')}</h1>
        <p className="text-gray-300 mb-10 text-lg">{t('setup.username.subtitle')}</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-lg">
              bioverse.app/
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                const val = e.target.value.replace(/\s/g, '');
                setUsername(val);
                if (val) checkUsername(val);
                else setStatus('idle');
              }}
              className="w-full bg-[#141414]/80 border-2 border-white/10 rounded-2xl py-5 pl-[140px] pr-6 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-gray-600 text-lg font-bold"
              placeholder={t('setup.username.placeholder')}
              required
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2 font-bold uppercase text-[10px] tracking-widest">
              {status === 'checking' && <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />}
              {status === 'taken' && <span className="text-red-400 bg-red-500/10 px-2 py-1 rounded">Taken</span>}
              {status === 'available' && <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Available</span>}
              {status === 'invalid' && <span className="text-amber-400 bg-amber-500/10 px-2 py-1 rounded">Invalid</span>}
            </div>
          </div>

          {error && (
             <div className="text-red-400 text-sm font-bold bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center justify-center gap-2">
               <AlertCircle className="w-4 h-4" /> {error}
             </div>
          )}

          <button
            type="submit"
            disabled={status !== 'available' || loading}
            className="w-full py-5 rounded-full bg-white text-black font-black text-lg hover:bg-emerald-400 hover:text-black hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:bg-white disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-xl"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('setup.username.cta')}
          </button>
        </form>
      </div>
    </div>
  );
}
