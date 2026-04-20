import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { signInWithGoogle, signInWithFacebook, signInWithApple, signInWithInstagram, signInWithTikTok } from '../lib/firebase';
import { ArrowRight, Globe, Layers, BarChart3, ShieldCheck, X } from 'lucide-react';
import { t, setLanguage, getLanguage, Language } from '../lib/i18n';

export default function Landing() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [, setLangForceUpdate] = useState(0);

  useEffect(() => {
    const handleLangChange = () => setLangForceUpdate(prev => prev + 1);
    window.addEventListener('languagechange', handleLangChange);
    return () => window.removeEventListener('languagechange', handleLangChange);
  }, []);

  const handleProviderAuth = async (providerFn: () => Promise<any>) => {
    try {
      if (!user) {
        await providerFn();
      }
      navigate('/admin');
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuthClick = () => {
    if (user) {
      navigate('/admin');
    } else {
      setShowAuthModal(true);
    }
  };

  const currentLang = getLanguage();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-emerald-500 selection:text-black font-sans">
      
      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-[#141414] border border-white/10 rounded-3xl p-8 shadow-2xl"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 p-2 opacity-50 hover:opacity-100 hover:bg-white/10 rounded-full transition-all"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-bold">{t('auth.title')}</h3>
                <p className="text-gray-400 text-sm mt-1">{t('auth.subtitle')}</p>
              </div>

              <div className="space-y-3">
                 <button onClick={() => handleProviderAuth(signInWithGoogle)} className="w-full flex items-center justify-center gap-3 p-3 bg-white text-black rounded-xl font-bold hover:bg-gray-200 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    {t('auth.google')}
                 </button>
                 <button onClick={() => handleProviderAuth(signInWithApple)} className="w-full flex items-center justify-center gap-3 p-3 bg-black text-white border border-white/20 rounded-xl font-bold hover:bg-white/10 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V15.39h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 3.39h-2.33v6.489C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/></svg>
                    {t('auth.apple')}
                 </button>
                 <button onClick={() => handleProviderAuth(signInWithFacebook)} className="w-full flex items-center justify-center gap-3 p-3 bg-[#1877F2] text-white rounded-xl font-bold hover:bg-[#1877F2]/90 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    {t('auth.facebook')}
                 </button>
                 <button onClick={() => signInWithInstagram()} className="w-full flex items-center justify-center gap-3 p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:opacity-90 transition-opacity">
                    {t('auth.instagram')}
                 </button>
                 <button onClick={() => signInWithTikTok()} className="w-full flex items-center justify-center gap-3 p-3 bg-black text-white border border-white/20 rounded-xl font-bold hover:bg-gray-900 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-1.02 4.46-2.6 6.08-1.57 1.6-3.8 2.63-6.04 2.8-2.64.21-5.38-.45-7.46-2.1-1.97-1.56-3.19-3.95-3.37-6.43-.22-2.88.8-5.84 2.84-7.85 2-1.98 4.9-3.08 7.74-2.92v4.06c-1.62-.12-3.28.32-4.52 1.34-1.2 1-1.89 2.5-2.02 4.04-.15 1.76.62 3.51 1.91 4.67 1.25 1.13 3.01 1.62 4.67 1.41 1.69-.21 3.23-1.28 4.14-2.73.91-1.42 1.32-3.14 1.31-4.83.03-5.26.01-10.52.02-15.78z"/></svg>
                    {t('auth.tiktok')}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <nav className="fixed top-0 w-full z-40 px-6 py-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold tracking-tighter">BIOVERSE</span>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="hidden sm:flex items-center gap-2">
             {(['es', 'en', 'it', 'fr', 'de'] as Language[]).map(lang => (
               <button 
                 key={lang}
                 onClick={() => setLanguage(lang)}
                 className={`text-xl transition-all hover:scale-110 ${currentLang === lang ? 'opacity-100 scale-110' : 'opacity-50 grayscale hover:grayscale-0'}`}
                 title={lang.toUpperCase()}
               >
                 {lang === 'es' && '🇪🇸'}
                 {lang === 'en' && '🇺🇸'}
                 {lang === 'it' && '🇮🇹'}
                 {lang === 'fr' && '🇫🇷'}
                 {lang === 'de' && '🇩🇪'}
               </button>
             ))}
           </div>
           
          <button 
            onClick={handleAuthClick}
            className="text-xs font-mono uppercase tracking-widest hover:text-emerald-500 transition-colors"
          >
            {user ? t('nav.dashboard') : t('nav.signin')}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="pt-40 px-6 max-w-7xl mx-auto pb-40">
        <section className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8 uppercase">
              {t('hero.title.1')}<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">{t('hero.title.2')}</span>
            </h1>
            <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl mb-12">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={handleAuthClick}
                className="px-8 py-4 bg-white text-black font-bold flex items-center gap-2 hover:bg-emerald-500 transition-all group rounded-xl"
              >
                {t('hero.cta')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="px-8 py-4 border border-white/10 text-white font-bold backdrop-blur-sm rounded-xl">
                {t('hero.badge')}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Split */}
        <section className="mt-40 grid md:grid-cols-2 gap-24 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-mono mb-6">
              <ShieldCheck className="w-3 h-3" /> {t('features.badge')}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
              {t('features.title.1')} <br/>{t('features.title.2')}
            </h2>
            <div className="space-y-6">
              {[
                { icon: Layers, title: t('features.title.1'), desc: t('features.desc.1') },
                { icon: BarChart3, title: "Deep Analytics", desc: t('features.desc.2') },
                { icon: Globe, title: "Custom Domains", desc: t('features.desc.3') }
              ].map((f, i) => (
                <div key={i} className="flex gap-4 p-4 border border-white/5 hover:border-white/20 transition-colors rounded-2xl">
                  <f.icon className="w-6 h-6 text-emerald-500 shrink-0" />
                  <div>
                    <h3 className="font-bold mb-1">{f.title}</h3>
                    <p className="text-gray-400 text-sm">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-[4/5] bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-[3rem] border border-white/5 p-4 overflow-hidden">
               <div className="w-full h-full bg-[#141414] rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
                  <div className="w-full h-40 bg-gradient-to-br from-fuchsia-900 to-black relative">
                     <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#141414] to-transparent" />
                  </div>
                  <div className="p-8 space-y-4 -mt-16 relative z-10 text-center">
                    <div className="w-24 h-24 bg-gray-800 rounded-full mx-auto border-4 border-[#141414]" />
                    <div className="w-32 h-4 bg-gray-800 rounded mx-auto mt-4" />
                    <div className="w-48 h-2 bg-gray-800 rounded mx-auto opacity-50" />
                    <div className="pt-6 space-y-3">
                       {Array.from({length: 3}).map((_, i) => (
                        <div key={i} className="w-full h-14 bg-white/5 border border-white/10 rounded-xl" />
                       ))}
                    </div>
                  </div>
                  {/* Floating labels */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-10 right-10 p-3 bg-white text-black rounded-xl text-[10px] font-mono font-bold shadow-2xl"
                  >
                    GLASS STYLE
                  </motion.div>
               </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-40 border-t border-white/5 py-12 flex flex-col md:flex-row justify-between items-center gap-8 gap-y-4">
          <p className="text-gray-500 text-sm">{t('footer.rights')}</p>
           
          {/* Mobile Lang selector */}
          <div className="flex sm:hidden items-center gap-2 mb-4">
             {(['es', 'en', 'it', 'fr', 'de'] as Language[]).map(lang => (
               <button 
                 key={lang}
                 onClick={() => setLanguage(lang)}
                 className={`text-[10px] font-bold uppercase transition-colors px-2 py-1 rounded ${currentLang === lang ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-500 hover:text-white'}`}
               >
                 {lang}
               </button>
             ))}
           </div>

          <div className="flex gap-8 text-xs font-mono text-gray-400">
            <a href="#" className="hover:text-white transition-colors uppercase">{t('footer.terms')}</a>
            <a href="#" className="hover:text-white transition-colors uppercase">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-white transition-colors uppercase">{t('footer.support')}</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
