import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import { PropertyDetail } from './pages/PropertyDetail';
import { useGeminiVoice } from './hooks/useGeminiVoice';
import { OrbCanvas } from './components/Orb';
import { MOCK_PROPERTIES } from './data';

export const VoiceContext = createContext<any>(null);

function VoiceLayout({ children }: { children: React.ReactNode }) {
  const [displayedPropertyIds, setDisplayedPropertyIds] = useState<string[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    connectionState,
    serverState,
    errorMsg,
    startSession,
    cleanup,
    sendText
  } = useGeminiVoice();

  useEffect(() => {
    const handleUIUpdate = (event: any) => {
      console.log("Global Event Caught! Updating UI:", event.detail);
      const data = event.detail;
      if (data.name === 'display_properties') {
        const idList = data.args?.locations ? data.args.locations : [];
        setDisplayedPropertyIds(idList);
        if (location.pathname !== '/') {
          navigate('/');
        }
      } else if (data.name === 'navigate_to_property_details') {
         if (data.args?.property_title) {
           const match = MOCK_PROPERTIES.find(p => p.title.toLowerCase().includes(data.args.property_title.toLowerCase()));
           if (match) {
             navigate(`/property/${match.id}`);
           } else {
             console.log("Could not find property with title:", data.args.property_title);
           }
         }
      } else if (data.name === 'navigate_to_home') {
         navigate('/');
         if (data.args?.locations) {
           setDisplayedPropertyIds(data.args.locations);
         } else {
           setDisplayedPropertyIds([]);
         }
      }
    };
    window.addEventListener('AI_UI_UPDATE', handleUIUpdate);
    return () => window.removeEventListener('AI_UI_UPDATE', handleUIUpdate);
  }, [navigate, location.pathname]);

  const getOrbState = () => {
    if (connectionState === 'CONNECTING') return 'CONNECTING';
    if (connectionState === 'CONNECTED') return serverState;
    return 'IDLE';
  };

  const contextValue = {
    displayedPropertyIds,
    connectionState,
    serverState,
    errorMsg,
    startSession,
    cleanup,
    sendText,
    getOrbState
  };

  return (
    <VoiceContext.Provider value={contextValue}>
      {children}
    </VoiceContext.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <VoiceLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/property/:id" element={<PropertyDetail />} />
        </Routes>
      </VoiceLayout>
    </BrowserRouter>
  );
}

