import React, { useEffect, useState } from 'react';
import { TriageResponse, PriorityLevel, UserProfile } from '../types';
import RadarMap from './RadarMap';

interface DashboardProps {
  triageData: TriageResponse;
  onReset: () => void;
  locationWarning?: string | null;
  userProfile: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ triageData, onReset, locationWarning, userProfile }) => {
  const [timeLeft, setTimeLeft] = useState(triageData.etaMinutes * 60);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("DISPATCHED");
  const [updates, setUpdates] = useState<string[]>([]);
  const [contactNotified, setContactNotified] = useState<'idle' | 'sending' | 'sent'>('idle');

  // Calculate status based on time left
  useEffect(() => {
    const totalTime = triageData.etaMinutes * 60;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          setStatusText("ARRIVED");
          return 0;
        }
        return prev - 1;
      });
    }, 1000); 
    
    // Fast forward simulation for demo purposes
    const fastTimer = setInterval(() => {
        setTimeLeft(prev => {
             const newVal = prev - 5; // Decrease by 5 seconds every real second
             if (newVal <= 0) {
                 clearInterval(fastTimer);
                 setStatusText("ARRIVED");
                 return 0;
             }
             return newVal;
        })
    }, 1000);

    return () => clearInterval(fastTimer);
  }, [triageData.etaMinutes]);

  // Update progress and status text
  useEffect(() => {
    const totalTime = triageData.etaMinutes * 60;
    const currentProgress = ((totalTime - timeLeft) / totalTime) * 100;
    setProgress(currentProgress);

    if (currentProgress < 10) setStatusText("DISPATCHED");
    else if (currentProgress < 40) setStatusText("EN ROUTE");
    else if (currentProgress < 80) setStatusText("NEARBY");
    else if (currentProgress < 100) setStatusText("ARRIVING NOW");
    else setStatusText("ON SCENE");

  }, [timeLeft, triageData.etaMinutes]);

  // Generate simulated "Live Updates" from the "System"
  useEffect(() => {
      const msgs = [
          { time: 5, text: `Dispatch verified location.` },
          { time: 15, text: `${triageData.vehicleType} has departed station.` },
          { time: 40, text: `Traffic analysis: Route clear via Main St.` },
          { time: 70, text: `Paramedic team reviewing patient data.` },
          { time: 90, text: `Vehicle turning onto your street.` },
      ];
      
      const currentPercent = progress;
      const activeMsgs = msgs.filter(m => m.time <= currentPercent).map(m => m.text);
      setUpdates(activeMsgs);
  }, [progress, triageData.vehicleType]);

  // Simulate notifying contact
  useEffect(() => {
    if (userProfile.emergencyContactPhone && contactNotified === 'idle') {
      setContactNotified('sending');
      const timer = setTimeout(() => {
        setContactNotified('sent');
      }, 3500); // Simulate network delay
      return () => clearTimeout(timer);
    }
  }, [userProfile.emergencyContactPhone, contactNotified]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getPriorityColor = (p: PriorityLevel) => {
    switch(p) {
        case PriorityLevel.CRITICAL: return 'text-red-500 bg-red-500/10 border-red-500/50';
        case PriorityLevel.HIGH: return 'text-orange-500 bg-orange-500/10 border-orange-500/50';
        case PriorityLevel.MEDIUM: return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/50';
        case PriorityLevel.LOW: return 'text-green-500 bg-green-500/10 border-green-500/50';
    }
  };

  const isArrived = statusText === 'ARRIVED' || statusText === 'ON SCENE';

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      
      {locationWarning && (
        <div className="bg-yellow-900/20 border border-yellow-500/30 text-yellow-100 p-4 rounded-xl flex items-start gap-4 animate-fade-in">
           <div className="bg-yellow-500/20 p-2 rounded-lg shrink-0">
             <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           </div>
           <div>
              <h4 className="font-bold text-yellow-500 text-sm uppercase tracking-wide">Location Accuracy Warning</h4>
              <p className="text-sm text-yellow-200/80 mt-1 leading-relaxed">{locationWarning}</p>
           </div>
        </div>
      )}

      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl border ${getPriorityColor(triageData.priority)} flex flex-col items-center justify-center`}>
            <span className="text-xs uppercase font-bold opacity-70">Priority</span>
            <span className="text-xl font-black">{triageData.priority}</span>
        </div>
        <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-900/20 flex flex-col items-center justify-center">
            <span className="text-xs uppercase text-blue-300 font-bold opacity-70">Status</span>
            <span className={`text-xl font-black ${isArrived ? 'animate-pulse text-green-400' : 'text-blue-400'}`}>
                {statusText}
            </span>
        </div>
         <div className="p-4 rounded-xl border border-slate-700 bg-slate-800/50 flex flex-col items-center justify-center col-span-2 md:col-span-2">
            <span className="text-xs uppercase text-slate-400 font-bold opacity-70">Estimated Arrival</span>
            <span className="text-4xl font-mono font-black text-white">{formatTime(timeLeft)}</span>
            <span className="text-xs text-slate-500 mt-1">minutes remaining</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
          {/* Map Section */}
          <div className="bg-slate-800/30 rounded-2xl p-6 border border-slate-700 backdrop-blur-sm relative overflow-hidden">
             <h3 className="text-slate-400 text-sm font-bold uppercase mb-4 tracking-wider">Live Tracking</h3>
             <RadarMap progress={progress} eta={triageData.etaMinutes} isActive={timeLeft > 0} />
             <div className="mt-6 space-y-2">
                 <div className="flex justify-between text-xs text-slate-400 font-mono">
                     <span>DISPATCH</span>
                     <span>EN ROUTE</span>
                     <span>ARRIVED</span>
                 </div>
                 <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                     <div 
                        className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
                        style={{ width: `${progress}%` }}
                     />
                 </div>
             </div>

             {/* ARRIVED OVERLAY */}
             {isArrived && (
                 <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md rounded-2xl p-4 animate-fade-in text-center">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 border border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                       <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h4 className="text-white font-bold text-xl mb-1">Unit on Scene</h4>
                    <p className="text-slate-400 text-sm mb-6">Responders have arrived at your location.</p>
                    
                    <a href="tel:911" className="w-full max-w-[200px] bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl shadow-[0_0_40px_rgba(220,38,38,0.5)] flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] hover:-translate-y-1">
                        <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        CALL 911
                    </a>
                    <p className="text-xs text-slate-500 mt-4 max-w-[80%]">If you cannot locate the emergency unit, call 911 immediately.</p>
                 </div>
             )}
          </div>

          {/* AI Insights & Live Feed */}
          <div className="space-y-4">
              {/* Emergency Contact Notification */}
              {userProfile.emergencyContactName && (
                <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-700 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-2">
                     <h3 className="text-xs font-bold uppercase text-slate-400">Emergency Contact Alert</h3>
                     <span className={`text-xs font-mono px-2 py-0.5 rounded ${contactNotified === 'sent' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                        {contactNotified === 'sent' ? 'SENT' : 'SENDING...'}
                     </span>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white">{userProfile.emergencyContactName}</div>
                        <div className="text-xs text-slate-500">{userProfile.emergencyContactPhone}</div>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                     <p className="text-xs text-slate-400 font-mono italic">
                       "{triageData.contactNotificationMessage}"
                     </p>
                  </div>
                </div>
              )}

              {/* AI Advice Card */}
              <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900/40 rounded-2xl p-6 border border-indigo-500/30 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                      <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                  </div>
                  <h3 className="text-indigo-400 text-sm font-bold uppercase mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"/>
                      AI Guidance
                  </h3>
                  <p className="text-lg text-slate-200 font-medium leading-relaxed">
                      "{triageData.recommendedAction}"
                  </p>
                  <p className="text-xs text-slate-500 mt-4 border-t border-slate-700/50 pt-2">
                      Analysis by {triageData.assistantName} based on reported symptoms.
                  </p>
              </div>

              {/* Live Log */}
              <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800 h-40 overflow-y-auto flex flex-col-reverse">
                  <div className="space-y-3">
                      {updates.map((update, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-sm animate-fade-in">
                              <span className="text-blue-500 mt-1">●</span>
                              <span className="text-slate-300">{update}</span>
                          </div>
                      ))}
                      <div className="flex items-start gap-3 text-sm opacity-50">
                          <span className="text-slate-600 mt-1">●</span>
                          <span className="text-slate-500">Request received. Initializing AI Triage...</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      <button 
        onClick={onReset}
        className="w-full py-4 text-slate-500 hover:text-slate-300 text-sm font-semibold transition-colors"
      >
          CLOSE EMERGENCY SESSION
      </button>

    </div>
  );
};

export default Dashboard;