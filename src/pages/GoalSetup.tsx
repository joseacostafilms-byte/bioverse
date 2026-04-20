import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { t } from '../lib/i18n';

export default function GoalSetup() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !profile) navigate('/');
    // Check if user already completed this step or is already premium
    if (profile?.goal) {
       navigate('/setup/plan');
    }
  }, [user, profile, navigate]);

  const handleContinue = async () => {
    if (!user || !selectedGoal) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        goal: selectedGoal
      });
      navigate('/setup/plan');
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const GOALS = [
    { id: 'creator', label: t('setup.goal.creator'), desc: t('setup.goal.creator.desc'), color: 'bg-fuchsia-500', icon: '✨' },
    { id: 'business', label: t('setup.goal.business'), desc: t('setup.goal.business.desc'), color: 'bg-indigo-900', icon: '🏢' },
    { id: 'personal', label: t('setup.goal.personal'), desc: t('setup.goal.personal.desc'), color: 'bg-rose-500', icon: '👤' },
    { id: 'other', label: t('setup.goal.other'), desc: t('setup.goal.other.desc'), color: 'bg-emerald-500', icon: '💡' }
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-gray-900 flex flex-col items-center py-12 px-6">
      
      {/* Progress Bar */}
      <div className="w-full max-w-sm mb-12 flex items-center justify-center gap-2">
        <div className="w-16 h-1 rounded flex-1 bg-fuchsia-500" />
        <div className="w-16 h-1 rounded flex-1 bg-gray-200" />
      </div>

      <div className="max-w-md w-full text-center mb-8">
        <h1 className="text-3xl font-black tracking-tight mb-4">
          {t('setup.goal.title')}
        </h1>
        <p className="text-gray-500">
          {t('setup.goal.subtitle')}
        </p>
      </div>

      <div className="max-w-md w-full space-y-4 mb-10">
        {GOALS.map((goal) => (
          <button
            key={goal.id}
            onClick={() => setSelectedGoal(goal.id)}
            className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${
              selectedGoal === goal.id ? 'border-fuchsia-500 ring-2 ring-fuchsia-500/10 bg-white shadow-lg' : 'border-gray-200 bg-white hover:border-fuchsia-300'
            }`}
          >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 text-white ${goal.color}`}>
              {goal.icon}
            </div>
            <div>
              <h3 className="font-bold text-lg">{goal.label}</h3>
              <p className="text-sm text-gray-500 leading-snug mt-1">{goal.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="w-full max-w-md mt-auto">
        <button
          onClick={handleContinue}
          disabled={!selectedGoal || loading}
          className="w-full py-4 rounded-full bg-gray-200 text-gray-400 font-bold transition-all disabled:opacity-50 enabled:bg-fuchsia-600 enabled:text-white enabled:hover:bg-fuchsia-700 enabled:shadow-lg"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t('setup.continue')}
        </button>
      </div>

    </div>
  );
}
