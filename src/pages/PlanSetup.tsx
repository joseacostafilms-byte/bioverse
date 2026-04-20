import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Check, Star, Bell, Shield, ArrowRight } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function PlanSetup() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !profile) navigate('/');
    if (profile?.isPremium) navigate('/admin');
  }, [user, profile, navigate]);

  const handleContinueWithFree = async () => {
    navigate('/admin');
  };

  const handleStartProTrial = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isPremium: true
      });
      navigate('/admin');
    } catch (err) {
      console.error(err);
      navigate('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center py-12 px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="font-bold text-xl tracking-tight">BioVerse</span>
            <span className="text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-widest">Pro</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
            Claim a free 7-day Pro trial
          </h1>
          <p className="text-gray-500 text-sm">
            Start with the full power of BioVerse!
          </p>
        </div>

        <div className="relative pl-6 mb-12">
          {/* Timeline Line */}
          <div className="absolute left-10 top-8 bottom-8 w-px bg-gray-200" />
          
          <div className="space-y-8">
            <div className="relative flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-fuchsia-600 flex items-center justify-center shrink-0 z-10 text-white">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div className="pt-2">
                <h3 className="font-bold">Today</h3>
                <p className="text-gray-500 text-sm mt-1">Get started with the world's most trusted link in bio, <span className="underline cursor-pointer">cancel any time</span>.</p>
              </div>
            </div>

            <div className="relative flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0 z-10 text-white">
                <Bell className="w-5 h-5" />
              </div>
              <div className="pt-2">
                <h3 className="font-bold">In 5 days</h3>
                <p className="text-gray-500 text-sm mt-1">We'll send you a reminder email that your trial is ending soon.</p>
              </div>
            </div>

            <div className="relative flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0 z-10 text-white">
                <Shield className="w-5 h-5" />
              </div>
              <div className="pt-2">
                <h3 className="font-bold">In 7 days</h3>
                <p className="text-gray-500 text-sm mt-1">Your plan starts, unless you cancelled during the trial.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-1 text-amber-500 mb-2">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
          </div>
          <p className="text-gray-500 text-sm">Trusted by 70M+ creators</p>

          <button 
            onClick={handleStartProTrial}
            className="w-full py-4 rounded-full bg-purple-600 text-white font-bold hover:bg-purple-700 transition-colors"
          >
            Continue with free trial
          </button>
          
          <button 
            onClick={handleContinueWithFree}
            className="w-full py-4 text-gray-500 font-medium hover:text-black transition-colors"
          >
            No thanks, start with Free plan
          </button>
        </div>
      </div>
    </div>
  );
}
