import React, { useState, useEffect } from 'react';
import type { UserData, Theme } from './types';
import LoginPage from './components/LoginPage';
import UserInfoPage from './components/UserInfoPage';
import ChatPage from './components/ChatPage';

type Page = 'login' | 'info' | 'chat';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('login');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [pageKey, setPageKey] = useState(Date.now());
  const [theme, setTheme] = useState<Theme>('theme-neon-blue');

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const handleLogin = (name: string, email: string) => {
    setUserData({ name, email } as UserData);
    setPage('info');
  };

  const handleInfoSubmit = (data: UserData) => {
    setUserData(data);
    setPage('chat');
  };
  
  const handleStartOver = () => {
    setUserData(null);
    setPage('login');
    setPageKey(Date.now());
  };

  const renderPage = () => {
    switch (page) {
      case 'login':
        return <LoginPage onLogin={handleLogin} />;
      case 'info':
        return userData && <UserInfoPage userData={userData} onSubmit={handleInfoSubmit} />;
      case 'chat':
        return userData && <ChatPage userData={userData} onStartOver={handleStartOver} theme={theme} setTheme={setTheme} />;
      default:
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return (
    <main className={`min-h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden relative ${theme}`}>
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vmin] h-[150vmin] rounded-full filter blur-3xl transition-colors duration-1000 animate-[aurora-glow_20s_ease-in-out_infinite]"
        style={{ background: `radial-gradient(circle, rgba(from var(--glow-1-hex) r g b / 0.8), transparent 60%)` }}
      ></div>
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vmin] h-[150vmin] rounded-full filter blur-3xl transition-colors duration-1000 animate-[aurora-glow_20s_ease-in-out_infinite_5s]"
        style={{ background: `radial-gradient(circle, rgba(from var(--glow-2-hex) r g b / 0.8), transparent 60%)` }}
      ></div>
      
      <div key={pageKey} className="z-10 w-full max-w-7xl animate-fade-in">
        {renderPage()}
      </div>
    </main>
  );
};

export default App;