import React from 'react';
import type { UserData, ChatHistoryItem, Theme } from '../types';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  userData: UserData;
  history: ChatHistoryItem[];
  activeChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onSaveTranscript: () => void;
  onStartOver: () => void;
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const SearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09.921-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);


const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, userData, history, activeChatId, onNewChat, onSelectChat, onDeleteChat, onSaveTranscript, onStartOver, currentTheme, setTheme, searchTerm, setSearchTerm }) => {

  const themes: { name: Theme, label: string }[] = [
    { name: 'theme-neon-blue', label: 'Neon Blue' },
    { name: 'theme-violet-flux', label: 'Violet Flux' },
    { name: 'theme-cyber-crimson', label: 'Cyber Crimson' },
  ];

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="fixed top-5 left-5 z-40 md:hidden bg-black/50 p-2 rounded-md">
        {/* Menu Icon */}
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      <aside className={`fixed top-0 left-0 h-full z-30 w-80 bg-black/40 backdrop-blur-lg border-r border-[var(--border-accent)]/20 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}>
        <div className="p-4 border-b border-[var(--border-accent)]/20">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 text-cyber-gradient text-glow">
              <span className="text-2xl" aria-hidden="true">🌌</span>
              <h2 className="text-xl font-orbitron">Future Lens AI</h2>
            </div>
            <p className="text-xs font-orbitron text-cyber-gradient text-glow mt-1">
                Built By Surya Krishna
            </p>
          </div>
          <div className="mt-4">
            <p className="font-semibold text-lg">{userData.name}</p>
            <p className="text-sm text-gray-400">{userData.email}</p>
          </div>
        </div>
        
        <div className="flex-grow p-4 overflow-y-auto">
          <button onClick={onNewChat} className="w-full text-left p-3 rounded-lg hover:bg-white/10 transition-colors mb-4">
            + New Chat
          </button>
          
          <div className="relative mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search conversations..."
              className="w-full bg-black/30 border border-purple-500/50 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-transparent transition-all input-glow-focus"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <SearchIcon className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Past Conversations</h3>
          <div className="space-y-2">
            {history.map(item => (
              <div
                key={item.id}
                className={`group w-full flex items-center justify-between rounded-lg transition-colors ${activeChatId === item.id ? 'bg-[var(--button-accent)]/20' : 'hover:bg-white/10'}`}
              >
                <button
                  onClick={() => onSelectChat(item.id)}
                  className="flex-grow text-left p-3 truncate"
                >
                  {item.title}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(item.id);
                  }}
                  className="p-3 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                  aria-label={`Delete conversation titled: ${item.title}`}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-[var(--border-accent)]/20 space-y-3">
            <div>
              <label className="text-sm font-semibold text-gray-400 uppercase mb-2 block">Theme</label>
              <div className="flex gap-2">
                {themes.map(theme => (
                    <button key={theme.name} onClick={() => setTheme(theme.name)} className={`flex-1 p-2 text-sm rounded-md border-2 transition-all ${currentTheme === theme.name ? 'border-[var(--button-accent)] bg-[var(--button-accent)]/20' : 'border-transparent hover:bg-white/10'}`}>
                        {theme.label}
                    </button>
                ))}
              </div>
            </div>
          <button onClick={onSaveTranscript} className="w-full text-left p-3 rounded-lg hover:bg-white/10 transition-colors">
            💾 Save Transcript
          </button>
          <button onClick={onStartOver} className="w-full text-left p-3 rounded-lg hover:bg-white/10 transition-colors">
            🔁 Start Over
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;