import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { Check, Star, Zap, Shield, ArrowRight } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { t } from '../lib/i18n';

export default function PlanSetup() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'pro' | 'business'>('basic');

  useEffect(() => {
    if (!user || !profile) navigate('/');
    if (profile?.isPremium) navigate('/admin');
  }, [user, profile, navigate]);

  const handleContinueWithFree = async () => {
    navigate('/admin');
  };

  const handleUpgrade = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isPremium: true,
        planId: selectedPlan
      });
      navigate('/admin');
    } catch (err) {
      console.error(err);
      navigate('/admin');
    }
  };

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$3',
      features: ['Unlimited Links', 'Core Themes', 'Basic Analytics'],
      icon: <Star className="w-5 h-5 text-amber-500" />
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$10',
      popular: true,
      features: ['All Basic Features', 'Custom Themes', 'Advanced Analytics', 'Remove Branding'],
      icon: <Zap className="w-5 h-5 text-emerald-500" />
    },
    {
      id: 'business',
      name: 'Business',
      price: '$15',
      features: ['All Pro Features', 'Course Integration', 'Calendar Booking', 'Team Access'],
      icon: <Shield className="w-5 h-5 text-purple-500" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-black py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            {t('setup.plan.title')}
          </h1>
          <p className="text-gray-500 text-lg">
            Choose the perfect plan to grow your audience and monetize your content.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map(plan => (
            <div 
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id as any)}
              className={`relative bg-white rounded-3xl p-6 cursor-pointer border-2 transition-all ${selectedPlan === plan.id ? 'border-black ring-4 ring-black/5 shadow-xl' : 'border-gray-200 hover:border-black/30'}`}
            >
               {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    Most Popular
                  </div>
               )}
               <div className="flex justify-between items-center mb-6">
                 {plan.icon}
                 <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlan === plan.id ? 'border-black bg-black' : 'border-gray-300'}`}>
                   {selectedPlan === plan.id && <div className="w-2 h-2 rounded-full bg-white" />}
                 </div>
               </div>
               <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
               <div className="flex items-baseline gap-1 mb-6">
                 <span className="text-4xl font-black">{plan.price}</span>
                 <span className="text-gray-500">/mo</span>
               </div>
               <ul className="space-y-3">
                 {plan.features.map((feature, i) => (
                   <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                     <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                     {feature}
                   </li>
                 ))}
               </ul>
            </div>
          ))}
        </div>

        <div className="max-w-md mx-auto text-center space-y-4">
          <button 
            onClick={handleUpgrade}
            className="w-full py-4 rounded-full bg-black text-white font-bold text-lg hover:bg-gray-800 transition-colors shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            Upgrade to {plans.find(p => p.id === selectedPlan)?.name}
          </button>
          
          <button 
            onClick={handleContinueWithFree}
            className="w-full py-4 text-gray-500 font-medium hover:text-black transition-colors"
          >
            {t('setup.plan.free')}
          </button>
        </div>
      </div>
    </div>
  );
}
