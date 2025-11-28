import React, { useState } from 'react';
import { AppState, EmergencyDetails, TriageResponse, UserProfile } from './types';
import { analyzeEmergency } from './services/geminiService';
import Dashboard from './components/Dashboard';
import ProfileModal from './components/ProfileModal';

// Mock location function
const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation not supported"));
        } else {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        }
    });
};

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [emergencyDesc, setEmergencyDesc] = useState("");
  const [triageResult, setTriageResult] = useState<TriageResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationWarning, setLocationWarning] = useState<string | null>(null);
  
  // Profile State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    phone: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    medicalInfo: ""
  });

  const handleEmergencyCall = async () => {
    if (!emergencyDesc.trim()) {
        setError("Please describe the emergency briefly.");
        return;
    }

    setAppState(AppState.ANALYZING);
    setIsLoading(true);
    setError(null);
    setLocationWarning(null);

    try {
      // Simulate getting location
      try {
        await getCurrentLocation();
      } catch (e) {
        console.warn("Location permission denied or failed, proceeding without precise location.");
        setLocationWarning("Precise GPS signal lost or denied. Tracking is relying on cellular triangulation which may be less accurate. Please keep your phone on.");
      }

      // Call AI Service, passing the user's name if available
      const result = await analyzeEmergency(emergencyDesc, userProfile.name);
      setTriageResult(result);
      
      // Simulate a slight delay for dramatic effect of "Dispatching"
      setTimeout(() => {
          setAppState(AppState.DISPATCHED);
          setIsLoading(false);
      }, 2000);

    } catch (err) {
      console.error(err);
      setError("System failed to connect. Please dial 911 immediately.");
      setAppState(AppState.IDLE);
      setIsLoading(false);
    }
  };

  const resetApp = () => {
    setAppState(AppState.IDLE);
    setEmergencyDesc("");
    setTriageResult(null);
    setLocationWarning(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500/30">
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        profile={userProfile} 
        onSave={setUserProfile} 
      />

      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetApp}>
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)]">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            </div>
            <span className="font-black text-xl tracking-tight">ResQ<span className="text-red-500">.AI</span></span>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsProfileOpen(true)}
               className="hidden md:flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
             >
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <span>{userProfile.name ? userProfile.name.split(' ')[0] : 'Profile'}</span>
             </button>
             <span className="hidden md:inline-block text-xs font-mono text-slate-500 border-l border-slate-800 pl-4">
               SYSTEM STATUS: <span className="text-green-500">ONLINE</span>
             </span>
          </div>
        </div>
      </nav>

      <main className="flex-grow flex flex-col">
        {appState === AppState.IDLE && (
          <div className="flex-grow flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="max-w-lg w-full space-y-8">
              <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
                  Emergency Response
                </h1>
                <p className="text-slate-400 text-lg">
                  AI-Powered Dispatch & Real-time Tracking
                </p>
              </div>

              <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-6">
                
                {/* Mobile Profile Prompt if no name set */}
                {!userProfile.name && (
                   <div 
                      onClick={() => setIsProfileOpen(true)}
                      className="bg-blue-900/10 border border-blue-500/20 p-3 rounded-lg flex items-center justify-between cursor-pointer hover:bg-blue-900/20 transition-colors"
                   >
                       <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           </div>
                           <div className="text-left">
                               <p className="text-blue-400 text-xs font-bold uppercase">Setup Profile</p>
                               <p className="text-slate-400 text-xs">Add your details for faster dispatch.</p>
                           </div>
                       </div>
                       <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                   </div>
                )}

                <div className="space-y-2 text-left">
                   <label htmlFor="emergency-input" className="text-xs font-bold uppercase text-slate-500 ml-1">Nature of Emergency</label>
                   <textarea
                    id="emergency-input"
                    value={emergencyDesc}
                    onChange={(e) => setEmergencyDesc(e.target.value)}
                    placeholder="e.g., Severe chest pain, trouble breathing..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none h-32 text-lg"
                   />
                </div>
                
                {error && (
                    <div className="text-red-400 bg-red-900/20 p-3 rounded-lg text-sm border border-red-900/50">
                        {error}
                    </div>
                )}

                <button
                  onClick={handleEmergencyCall}
                  className="group relative w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xl py-5 rounded-xl transition-all shadow-[0_0_40px_rgba(220,38,38,0.4)] hover:shadow-[0_0_60px_rgba(220,38,38,0.6)] hover:-translate-y-1 active:translate-y-0"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    REQUEST HELP
                    <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                  </span>
                  <div className="absolute inset-0 rounded-xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shine" />
                  </div>
                </button>
              </div>

              <div className="flex justify-center gap-8 text-slate-600">
                <div className="flex flex-col items-center">
                    <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-xs font-bold">Instant Triage</span>
                </div>
                <div className="flex flex-col items-center">
                    <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                    <span className="text-xs font-bold">GPS Location</span>
                </div>
                <div className="flex flex-col items-center">
                    <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <span className="text-xs font-bold">Fast Dispatch</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {appState === AppState.ANALYZING && (
          <div className="flex-grow flex flex-col items-center justify-center p-6 text-center">
             <div className="relative">
                 <div className="w-24 h-24 rounded-full border-t-4 border-red-500 animate-spin absolute inset-0"></div>
                 <div className="w-24 h-24 rounded-full border-b-4 border-blue-500 animate-spin absolute inset-0 animation-delay-500" style={{ animationDirection: 'reverse' }}></div>
                 <div className="w-24 h-24 flex items-center justify-center text-3xl">🤖</div>
             </div>
             <h2 className="mt-8 text-2xl font-bold text-white animate-pulse">Analyzing Situation...</h2>
             <p className="mt-2 text-slate-400 max-w-sm">Gemini AI is assessing priority{userProfile.name ? ` for ${userProfile.name}` : ''} and identifying nearest units.</p>
          </div>
        )}

        {appState === AppState.DISPATCHED && triageResult && (
           <div className="flex-grow flex flex-col p-4 md:p-8 animate-fade-in-up">
              <Dashboard 
                triageData={triageResult} 
                onReset={resetApp} 
                locationWarning={locationWarning}
                userProfile={userProfile}
              />
           </div>
        )}
      </main>

      <footer className="py-6 text-center text-slate-600 text-xs border-t border-slate-900">
        <p>© 2024 ResQ-AI. For demonstration purposes only. In a real emergency, dial 911.</p>
      </footer>
      
      <style>{`
        @keyframes shine {
            100% { transform: translateX(100%); }
        }
        .animate-shine {
            animation: shine 1.5s infinite;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fadeIn 0.5s ease-out forwards;
        }
        .animate-fade-in-up {
            animation: fadeIn 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default App;