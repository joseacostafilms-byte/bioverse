import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { signInWithGoogle } from '../lib/firebase';
import { ArrowRight, Globe, Layers, BarChart3, ShieldCheck } from 'lucide-react';

export default function Landing() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async () => {
    try {
      if (!user) {
        await signInWithGoogle();
      }
      navigate('/admin');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-emerald-500 selection:text-black">
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 px-6 py-8 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-black" />
          </div>
          <span className="text-xl font-bold tracking-tighter">BIOVERSE</span>
        </div>
        <button 
          onClick={handleAuth}
          className="text-xs font-mono uppercase tracking-widest hover:text-emerald-500 transition-colors"
        >
          {user ? 'Dashboard' : 'Sign In'}
        </button>
      </nav>

      {/* Hero */}
      <main className="pt-40 px-6 max-w-7xl mx-auto">
        <section className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8">
              PROFESSIONALIZE<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-500">YOUR PRESENCE.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl mb-12">
              Transform your digital footprint with BioVerse. Built by Altera Studio for entrepreneurs who demand high-performance personal branding.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={handleAuth}
                className="px-8 py-4 bg-white text-black font-bold flex items-center gap-2 hover:bg-emerald-500 transition-all group"
              >
                GET STARTED <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="px-8 py-4 border border-white/10 text-white font-bold backdrop-blur-sm">
                ALREADY IN USE BY 1.2K+
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Split */}
        <section className="mt-40 grid md:grid-cols-2 gap-24 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-mono mb-6">
              <ShieldCheck className="w-3 h-3" /> SECURITY FIRST
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
              Modular Control <br/>for Fluid Growth.
            </h2>
            <div className="space-y-6">
              {[
                { icon: Layers, title: "Template Engine", desc: "15+ pre-defined designs with deep palette control." },
                { icon: BarChart3, title: "Deep Analytics", desc: "Track devices, location, and conversion rates." },
                { icon: Globe, title: "Custom Domains", desc: "Use your own URL for true brand independence." }
              ].map((f, i) => (
                <div key={i} className="flex gap-4 p-4 border border-white/5 hover:border-white/20 transition-colors">
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
            <div className="aspect-[4/5] bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-3xl border border-white/5 p-4 overflow-hidden">
               <div className="w-full h-full bg-[#141414] rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
                  <div className="p-8 space-y-4">
                    <div className="w-16 h-16 bg-gray-800 rounded-full mx-auto" />
                    <div className="w-32 h-4 bg-gray-800 rounded mx-auto" />
                    <div className="w-48 h-2 bg-gray-800 rounded mx-auto opacity-50" />
                    <div className="pt-4 space-y-2">
                       {Array.from({length: 4}).map((_, i) => (
                        <div key={i} className="w-full h-12 bg-white/5 border border-white/10 rounded-lg" />
                       ))}
                    </div>
                  </div>
                  {/* Floating labels */}
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute top-10 right-10 p-3 bg-emerald-500 text-black text-[10px] font-mono font-bold rotate-12"
                  >
                    LIVE PREVIEW
                  </motion.div>
               </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-40 border-t border-white/5 py-12 flex flex-col md:flex-row justify-between items-center gap-8 gap-y-4">
          <p className="text-gray-500 text-sm">© 2026 Altera Studio. All rights reserved.</p>
          <div className="flex gap-8 text-xs font-mono text-gray-400">
            <a href="#" className="hover:text-white transition-colors uppercase">Terms</a>
            <a href="#" className="hover:text-white transition-colors uppercase">Privacy</a>
            <a href="#" className="hover:text-white transition-colors uppercase">Support</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
