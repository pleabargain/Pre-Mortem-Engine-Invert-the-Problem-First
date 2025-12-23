
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Step, 
  AppState, 
  FailureRoadmap, 
  InversionGoal, 
  PhaseItem 
} from './types';
import { generateFailureRoadmap, invertDecisions } from './geminiService';

// --- Components ---

const GlitchText: React.FC<{ text: string, className?: string }> = ({ text, className = "" }) => (
  <span className={`glitch-hover inline-block ${className}`}>{text}</span>
);

const DoomSlider: React.FC<{ value: number, onChange: (val: number) => void }> = ({ value, onChange }) => {
  const labels = ["Annoying Flop", "Financial Ruin", "Federal Indictment"];
  const getLabel = (v: number) => {
    if (v <= 3) return labels[0];
    if (v <= 7) return labels[1];
    return labels[2];
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between items-end">
        <label className="font-mono text-sm text-[#FFD700]">DOOM MAGNITUDE</label>
        <span className="font-mono text-xs text-red-500 uppercase">{getLabel(value)}</span>
      </div>
      <input 
        type="range" 
        min="1" 
        max="10" 
        step="1"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-black rounded-lg appearance-none cursor-pointer accent-[#FFD700] border border-zinc-700"
      />
      <div className="flex justify-between text-[10px] font-mono text-zinc-500">
        <span>01</span>
        <span>05</span>
        <span>10</span>
      </div>
    </div>
  );
};

const DecisionCard: React.FC<{ 
  item: PhaseItem, 
  isSelected: boolean, 
  onToggle: () => void,
  typeLabel: string,
  extra?: string 
}> = ({ item, isSelected, onToggle, typeLabel, extra }) => (
  <motion.div 
    whileHover={{ scale: 1.01 }}
    onClick={onToggle}
    className={`group cursor-pointer p-4 border transition-all duration-300 ${
      isSelected 
        ? 'bg-[#FFD700] border-[#FFD700] text-black shadow-[0_0_15px_rgba(255,215,0,0.3)]' 
        : 'bg-black border-zinc-800 hover:border-zinc-600 text-white'
    }`}
  >
    <div className="flex justify-between items-start mb-2">
      <span className={`text-[10px] font-mono px-1 border ${isSelected ? 'border-black' : 'border-[#FFD700] text-[#FFD700]'}`}>
        {typeLabel}
      </span>
      {extra && <span className="text-[10px] font-mono opacity-60 italic">{extra}</span>}
    </div>
    <h4 className={`font-bold mb-1 font-mono uppercase text-sm ${isSelected ? 'text-black' : 'text-[#FFD700]'}`}>
      {item.title}
    </h4>
    <p className="text-xs leading-relaxed opacity-80">{item.description}</p>
    {item.severity && (
      <div className="mt-3 pt-2 border-t border-current border-opacity-20 flex items-center justify-between">
         <span className="text-[10px] font-bold">SEVERITY:</span>
         <span className="text-[10px] uppercase">{item.severity}</span>
      </div>
    )}
  </motion.div>
);

// --- Main App ---

export default function App() {
  const [state, setState] = useState<AppState>({
    step: 'landing',
    isInverted: false,
    idea: '',
    doomLevel: 5,
    failureData: null,
    selectedIds: new Set(),
    inversionGoals: []
  });

  const [error, setError] = useState<string | null>(null);

  const handleStartAnalysis = async () => {
    if (!state.idea.trim()) return;
    setState(prev => ({ ...prev, step: 'simulating' }));
    try {
      const data = await generateFailureRoadmap(state.idea, state.doomLevel);
      setState(prev => ({ ...prev, step: 'roadmap', failureData: data }));
    } catch (err) {
      setError("Analysis corrupted. The chaos was too great.");
      setState(prev => ({ ...prev, step: 'landing' }));
    }
  };

  const toggleDecision = (id: string) => {
    const newSelected = new Set(state.selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setState(prev => ({ ...prev, selectedIds: newSelected }));
  };

  const handleAutopsy = () => {
    setState(prev => ({ ...prev, step: 'autopsy' }));
  };

  const handleInversion = async () => {
    setState(prev => ({ ...prev, step: 'inverting' }));
    
    // Find all selected decisions
    const allDecisions = [
      ...(state.failureData?.phases.market_ignorance || []),
      ...(state.failureData?.phases.financial_suicide || []),
      ...(state.failureData?.phases.operational_hell || [])
    ];
    const selected = allDecisions.filter(d => state.selectedIds.has(d.id));

    try {
      const goals = await invertDecisions(selected.length > 0 ? selected : allDecisions.slice(0, 3));
      setState(prev => ({ 
        ...prev, 
        step: 'inversion', 
        isInverted: true, 
        inversionGoals: goals 
      }));
    } catch (err) {
      setError("Failed to invert chaos. Darkness prevails.");
      setState(prev => ({ ...prev, step: 'roadmap' }));
    }
  };

  // --- Views ---

  const LandingView = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-12 py-12 px-6"
    >
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-mono font-bold tracking-tighter text-[#FFD700]">
          THE PRE-MORTEM <br/> ENGINE
        </h1>
        <p className="text-zinc-500 font-mono text-sm leading-relaxed max-w-lg">
          SYSTEM STATUS: <span className="text-green-500">OPERATIONAL</span><br/>
          OBJECTIVE: IDENTIFY CRITICAL FAILURE PATHS THROUGH STRATEGIC INVERSION.
        </p>
      </div>

      <div className="space-y-8 bg-black/50 p-8 border border-zinc-800 relative overflow-hidden">
        <div className="scanline"></div>
        <div className="space-y-2">
          <label className="font-mono text-xs uppercase text-zinc-500">Target Concept</label>
          <input 
            autoFocus
            className="w-full bg-transparent border-b-2 border-zinc-700 focus:border-[#FFD700] text-xl md:text-2xl font-mono py-2 outline-none transition-colors"
            placeholder="e.g. Artisanal ice cube subscription..."
            value={state.idea}
            onChange={(e) => setState(prev => ({ ...prev, idea: e.target.value }))}
            onKeyDown={(e) => e.key === 'Enter' && handleStartAnalysis()}
          />
        </div>

        <DoomSlider value={state.doomLevel} onChange={(v) => setState(prev => ({ ...prev, doomLevel: v }))} />

        <button 
          onClick={handleStartAnalysis}
          disabled={!state.idea.trim()}
          className="w-full py-4 bg-[#FFD700] text-black font-mono font-bold uppercase tracking-widest hover:bg-yellow-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          EXECUTE SIMULATION
        </button>
      </div>
    </motion.div>
  );

  const SimulatingView = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <div className="w-16 h-16 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin"></div>
      <div className="text-center font-mono space-y-2">
        <p className="text-xl animate-pulse">RUNNING FAILURE SCENARIOS...</p>
        <p className="text-xs text-zinc-500">CALCULATING BURN RATES | ANALYZING MARKET VOIDS | SIMULATING COLLAPSE</p>
      </div>
    </div>
  );

  const RoadmapView = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-5xl mx-auto py-12 px-6 space-y-12"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-8">
        <div className="space-y-2">
          <h2 className="text-sm font-mono text-[#FFD700] uppercase tracking-[0.2em]">The Failure Roadmap</h2>
          <h1 className="text-3xl font-mono font-bold uppercase">{state.idea}</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
             <div className="text-[10px] font-mono text-zinc-500">DOOM SCORE</div>
             <div className="text-3xl font-mono font-bold text-red-600">{state.failureData?.doom_score}%</div>
          </div>
          <button 
            onClick={handleAutopsy}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-mono text-xs font-bold uppercase tracking-wider"
          >
            VIEW AUTOPSY
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-6">
          <h3 className="font-mono text-lg font-bold flex items-center gap-2 border-b border-zinc-800 pb-2">
            <span className="text-[#FFD700]">01.</span> MARKET VOID
          </h3>
          {state.failureData?.phases.market_ignorance.map(item => (
            <DecisionCard 
              key={item.id} 
              item={item} 
              typeLabel="MARKET"
              isSelected={state.selectedIds.has(item.id)}
              onToggle={() => toggleDecision(item.id)}
            />
          ))}
        </div>

        <div className="space-y-6">
          <h3 className="font-mono text-lg font-bold flex items-center gap-2 border-b border-zinc-800 pb-2">
            <span className="text-[#FFD700]">02.</span> CASH BONFIRE
          </h3>
          {state.failureData?.phases.financial_suicide.map(item => (
            <DecisionCard 
              key={item.id} 
              item={item} 
              typeLabel="BURN"
              extra={item.estimated_burn}
              isSelected={state.selectedIds.has(item.id)}
              onToggle={() => toggleDecision(item.id)}
            />
          ))}
        </div>

        <div className="space-y-6">
          <h3 className="font-mono text-lg font-bold flex items-center gap-2 border-b border-zinc-800 pb-2">
            <span className="text-[#FFD700]">03.</span> OPERATIONAL HELL
          </h3>
          {state.failureData?.phases.operational_hell.map(item => (
            <DecisionCard 
              key={item.id} 
              item={item} 
              typeLabel="VOID"
              extra={item.time_wasted}
              isSelected={state.selectedIds.has(item.id)}
              onToggle={() => toggleDecision(item.id)}
            />
          ))}
        </div>
      </div>

      <div className="sticky bottom-8 bg-black/90 p-6 border-2 border-red-600 flex flex-col md:flex-row items-center justify-between gap-4 z-50">
        <div className="text-center md:text-left">
           <p className="font-mono text-xs text-red-500 font-bold uppercase">Critical Phase: Selection Required</p>
           <p className="text-xs text-zinc-400">Select the decisions that tempt you most to see the path to inversion.</p>
        </div>
        <button 
          onClick={handleInversion}
          className="w-full md:w-auto px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-mono font-bold uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-pulse"
        >
          INVERT THE PROBLEM
        </button>
      </div>
    </motion.div>
  );

  const AutopsyView = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto py-12 px-6 space-y-12"
    >
      <div className="text-center space-y-4">
        <h2 className="text-sm font-mono text-zinc-500 uppercase tracking-widest">Post-Mortem Result</h2>
        <h1 className="text-5xl font-mono font-bold italic tracking-tighter text-red-600">"{state.failureData?.the_obituary.headline}"</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 border-2 border-zinc-800 bg-zinc-900 flex flex-col items-center justify-center space-y-4">
           <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="440" strokeDashoffset="0" className="text-red-600" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-mono font-bold">100%</span>
                <span className="text-[10px] font-mono text-zinc-500">BURN RATE</span>
              </div>
           </div>
           <p className="text-center text-xs text-zinc-400 max-w-xs font-mono">ALL CAPITAL DEPLETED. ZERO PRODUCT-MARKET FIT. LOGISTICAL ENTROPY ACHIEVED.</p>
        </div>

        <div className="p-8 border-2 border-zinc-800 bg-zinc-900 space-y-6">
           <h3 className="text-xs font-mono text-zinc-500 uppercase">Viral Recap</h3>
           <div className="bg-black p-6 border border-zinc-800 relative">
             <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-zinc-700 rounded-full"></div>
                <div>
                  <p className="font-bold text-sm">TechFuneral</p>
                  <p className="text-xs text-zinc-500">@techfuneral</p>
                </div>
             </div>
             <p className="text-lg leading-relaxed font-mono">"{state.failureData?.the_obituary.tweet_text}"</p>
             <p className="mt-4 text-[10px] text-zinc-500 font-mono">1:42 PM · Oct 14, 202X · 1.2M Views</p>
           </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button 
          onClick={() => setState(prev => ({ ...prev, step: 'roadmap' }))}
          className="px-8 py-3 border border-zinc-700 hover:border-[#FFD700] hover:text-[#FFD700] font-mono text-xs uppercase tracking-widest transition-all"
        >
          &larr; BACK TO THE ROADMAP
        </button>
      </div>
    </motion.div>
  );

  const InversionView = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto py-12 px-6"
    >
      <div className="text-center mb-16 space-y-4">
        <h1 className="text-5xl font-mono font-bold text-blue-600 tracking-tighter">THE ANTI-FRAGILE BLUEPRINT</h1>
        <p className="text-slate-500 font-mono">WE TURNED YOUR DESTRUCTION INTO YOUR DEFENSE.</p>
      </div>

      <div className="space-y-6">
        {state.inversionGoals.map((goal, idx) => (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx} 
            className="flex flex-col md:flex-row items-center gap-6 p-6 border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex-1 space-y-1">
               <span className="text-[10px] font-mono text-red-500 font-bold uppercase">The Temptation</span>
               <p className="text-slate-400 italic line-through text-sm">"{goal.bad_decision}"</p>
            </div>
            <div className="hidden md:block">
               <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </div>
            <div className="flex-1 space-y-1">
               <span className="text-[10px] font-mono text-blue-600 font-bold uppercase">The Strategic Rule</span>
               <p className="text-slate-900 font-bold text-lg leading-tight">{goal.strategic_rule}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-20 p-12 bg-blue-50 border-2 border-blue-200 text-center space-y-6">
        <h3 className="text-2xl font-mono font-bold text-blue-900">MISSION READY</h3>
        <p className="text-blue-700 text-sm max-w-md mx-auto">You've identified the traps. These rules are now your guardrails. Any deviation from these rules returns you to the failure roadmap.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-10 py-4 bg-blue-600 text-white font-mono font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg"
        >
          START NEW SIMULATION
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className={`min-h-screen transition-colors duration-1000 overflow-x-hidden ${state.isInverted ? 'bg-slate-50 text-slate-900' : 'bg-[#1A1A1A] text-white'}`}>
      
      {/* Header Overlay */}
      {!state.isInverted && (
        <div className="fixed top-0 left-0 w-full p-4 flex justify-between items-center pointer-events-none z-[100]">
           <span className="text-[10px] font-mono text-[#FFD700] border border-[#FFD700] px-2 py-1">PRE-MORTEM v4.1.0</span>
           <span className="text-[10px] font-mono text-red-500 border border-red-500 px-2 py-1">CHAOS CONSULTANT ACTIVE</span>
        </div>
      )}

      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 bg-red-600 text-white p-4 font-mono text-sm z-[200]">
          ERROR: {error}
          <button onClick={() => setError(null)} className="ml-4 underline">DISMISS</button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {state.step === 'landing' && <LandingView key="landing" />}
        {state.step === 'simulating' && <SimulatingView key="simulating" />}
        {state.step === 'roadmap' && <RoadmapView key="roadmap" />}
        {state.step === 'autopsy' && <AutopsyView key="autopsy" />}
        {state.step === 'inverting' && (
          <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-mono text-xl text-blue-600">INVERTING CHAOS INTO STRATEGY...</p>
          </div>
        )}
        {state.step === 'inversion' && <InversionView key="inversion" />}
      </AnimatePresence>

      {/* Decorative Background for Dark Mode */}
      {!state.isInverted && (
        <div className="fixed inset-0 opacity-10 pointer-events-none z-[-1] overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent)]"></div>
          <div className="grid grid-cols-12 h-full w-full">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="border-r border-zinc-800 h-full"></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
