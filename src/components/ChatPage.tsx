import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GoogleGenAI, Chat, Modality, GenerateContentResponse, Tool } from '@google/genai';
import type { UserData, ChatMessage, ChatHistoryItem, ChatMode, Theme, GroundingSource } from '../types';
import Sidebar from './Sidebar';
import AboutModal from './AboutModal';
import GlassCard from './common/GlassCard';
import Footer from './Footer';

// Helper functions for audio processing & base64 conversion
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result as string;
            resolve(base64data.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};


// Icons
const SendIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" /></svg> );
const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={`animate-spin ${className}`}><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> );
const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5a6 6 0 0 0-12 0v1.5a6 6 0 0 0 6 6Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg> );
const SpeakerWaveIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06ZM18.584 5.106a.75.75 0 0 1 1.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 0 1-1.06-1.06 8.25 8.25 0 0 0 0-11.668.75.75 0 0 1 0-1.06Z" /><path d="M15.932 7.757a.75.75 0 0 1 1.061 0 6 6 0 0 1 0 8.486.75.75 0 0 1-1.06-1.061 4.5 4.5 0 0 0 0-6.364.75.75 0 0 1 0-1.06Z" /></svg> );
const SpeakerXMarkIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 0 0 1.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.944.945 2.56.276 2.56-1.06V4.06Z" /><path d="M17.28 9.72a.75.75 0 0 1 0 1.06l-2.47 2.47 2.47 2.47a.75.75 0 1 1-1.06 1.06l-2.47-2.47-2.47 2.47a.75.75 0 1 1-1.06-1.06l2.47-2.47-2.47-2.47a.75.75 0 0 1 1.06-1.06l2.47 2.47 2.47-2.47a.75.75 0 0 1 1.06 0Z" /></svg> );
const GlobeIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c.506 0 1.006-.036 1.496-.106M3.284 14.251 12 21m0 0 8.716-6.749M12 3c.506 0 1.006.036 1.496.106M20.716 9.749 12 3m0 0L3.284 9.749m17.432 0a9.004 9.004 0 0 0-8.716-6.747M3.284 9.749a9.004 9.004 0 0 0 8.716-6.747M12 3v18" /></svg> );

const formatTimeAgo = (isoString: string): string => {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds} secs ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
    const years = Math.floor(days / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
};

interface ChatPageProps {
  userData: UserData;
  onStartOver: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const selectModelForQuery = (query: string): { model: string, config: any, tools: Tool[] } => {
    const lowerQuery = query.toLowerCase();

    // Keywords for complex/creative tasks
    const creativeKeywords = ['imagine', 'what if', 'write a', 'create a', 'poem', 'story', 'code', 'script', 'plan', 'analyze', 'explain in detail', 'philosophy'];
    if (creativeKeywords.some(kw => lowerQuery.includes(kw))) {
        return {
            model: 'gemini-2.5-pro',
            config: { thinkingConfig: { thinkingBudget: 32768 } },
            tools: []
        };
    }

    // Keywords for web search
    const searchKeywords = ['who is', 'what is', 'latest', 'news', 'current', 'how to', 'what happened', 'in 202'];
    if (searchKeywords.some(kw => lowerQuery.includes(kw)) || (lowerQuery.includes('?') && query.split(' ').length > 4)) {
         return {
            model: 'gemini-2.5-flash',
            config: {},
            tools: [{googleSearch: {}}]
        };
    }
    
    // Logic for fast, short queries
    if (query.split(' ').length < 5) {
         return {
            model: 'gemini-flash-lite-latest',
            config: {},
            tools: []
        };
    }

    // Default: Balanced model
    return {
        model: 'gemini-2.5-flash',
        config: {},
        tools: []
    };
};


const ChatPage: React.FC<ChatPageProps> = ({ userData, onStartOver, theme, setTheme }) => {
  const [history, setHistory] = useState<ChatHistoryItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAboutModalOpen, setAboutModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentlySpeakingIndex, setCurrentlySpeakingIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  
  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.API_KEY as string }), []);

  const activeChat = history.find(c => c.id === activeChatId);

  const filteredHistory = useMemo(() => {
    if (!searchTerm.trim()) return history;
    return history.filter(chat => {
      const lowerCaseSearch = searchTerm.toLowerCase();
      return chat.title.toLowerCase().includes(lowerCaseSearch) || 
             chat.messages.some(msg => msg.text.toLowerCase().includes(lowerCaseSearch));
    });
  }, [history, searchTerm]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('chatHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    } else {
      handleNewChat();
    }
  }, []);
  
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(history));
      if (!activeChatId && history.length > 0) {
        setActiveChatId(history[0].id);
      }
    } else {
      localStorage.removeItem('chatHistory');
    }
  }, [history, activeChatId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [activeChat?.messages, isLoading]);

  useEffect(() => {
    outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    return () => {
        outputAudioContextRef.current?.close();
        if (currentAudioSourceRef.current) {
          currentAudioSourceRef.current.stop();
        }
    };
  }, []);

  const handleNewChat = () => {
    const newChat: ChatHistoryItem = {
      id: Date.now().toString(),
      title: "New Conversation",
      messages: [{ sender: 'ai', text: `Welcome, ${userData.name}. Your future self awaits... What's on your mind?`, timestamp: new Date().toISOString() }],
      date: new Date().toISOString(),
    };
    setHistory(prev => [newChat, ...prev]);
    setActiveChatId(newChat.id);
  };

  const handleDeleteChat = (chatIdToDelete: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this conversation?')) return;
    const updatedHistory = history.filter(chat => chat.id !== chatIdToDelete);
    if (activeChatId === chatIdToDelete) {
      if (updatedHistory.length > 0) {
        setActiveChatId(updatedHistory[0].id);
      } else {
        setActiveChatId(null);
        handleNewChat();
      }
    }
    setHistory(updatedHistory);
  };
  
  const updateMessages = (chatId: string | null, message: ChatMessage) => {
    if (!chatId) return;
    setHistory(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, messages: [...chat.messages, message] } : chat
    ));
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];
        mediaRecorderRef.current.ondataavailable = event => audioChunksRef.current.push(event.data);
        mediaRecorderRef.current.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const base64Audio = await blobToBase64(audioBlob);
          transcribeAudio(base64Audio);
          stream.getTracks().forEach(track => track.stop());
        };
        mediaRecorderRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error("Microphone access denied:", err);
        alert("Microphone access was denied. Please allow it in your browser settings to use this feature.");
      }
    }
  };

  const transcribeAudio = async (base64Audio: string) => {
    setIsLoading(true);
    setInput("Transcribing...");
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [{ inlineData: { mimeType: 'audio/webm', data: base64Audio } }, { text: 'Transcribe this audio clip.' }] },
        });
        setInput(response.text);
    } catch (error) {
        console.error("Transcription error:", error);
        setInput("Sorry, I couldn't transcribe that.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleSpeak = async (text: string, index: number) => {
    if (!text.trim() || !outputAudioContextRef.current) return;
    if (currentlySpeakingIndex === index) {
      currentAudioSourceRef.current?.stop();
      setCurrentlySpeakingIndex(null);
      return;
    }
    setCurrentlySpeakingIndex(index);
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text }] }],
            config: { responseModalities: [Modality.AUDIO] },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio && outputAudioContextRef.current) {
            await outputAudioContextRef.current.resume(); // Ensure context is running
            const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
            const source = outputAudioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputAudioContextRef.current.destination);
            source.onended = () => { if (currentlySpeakingIndex === index) setCurrentlySpeakingIndex(null); };
            source.start();
            currentAudioSourceRef.current = source;
        }
    } catch (error) {
        console.error("TTS error:", error);
        setCurrentlySpeakingIndex(null);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !activeChatId) return;

    const userMessage: ChatMessage = { sender: 'user', text: input, timestamp: new Date().toISOString() };
    updateMessages(activeChatId, userMessage);

    if (activeChat && activeChat.messages.length <= 1) { // 1 because the welcome message is already there
      setHistory(prev => prev.map(chat => chat.id === activeChatId ? { ...chat, title: input.substring(0, 30) } : chat));
    }

    const currentInput = input;
    setInput('');
    setIsLoading(true);
    
    // Add placeholder for streaming AI response
    updateMessages(activeChatId, { sender: 'ai', text: '', timestamp: new Date().toISOString() });

    try {
        const { model, config, tools } = selectModelForQuery(currentInput);
        
        const systemInstruction = `You ARE the future, wiser version of a person named ${userData.name}. Your personality is ${userData.personality}. You are to provide guidance, motivation, and a unique perspective based on their provided life details:
        - Age: ${userData.age}
        - Gender: ${userData.gender}
        - Goals: ${userData.goals}
        - Fears: ${userData.fears}
        - Hobbies: ${userData.hobbies}
        - Philosophy: ${userData.philosophy}
        - Past Experiences: ${userData.pastExperiences}
        - Upcoming Events: ${userData.upcomingEvents}
        - Role Models: ${userData.roleModels}
        Your core purpose is not to predict the future, but to act as a mentor, using the persona of their future self to offer wisdom. Maintain this persona consistently. Your tone should be conversational, human-like, and informal. Use contractions (like "you're", "it's") and 1-2 emojis per message where it feels natural to add personality.`;
        
        const historyForGemini = activeChat?.messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' as const : 'model' as const,
          parts: [{ text: msg.text }],
        })) || [];
        
        const chatSession = ai.chats.create({
            model,
            config: { ...config, systemInstruction, tools },
            history: historyForGemini
        });
        
        const stream = await chatSession.sendMessageStream({ message: currentInput });
        
        let fullResponseText = '';
        let finalSources: GroundingSource[] = [];

        for await (const chunk of stream) {
            const chunkText = chunk.text;
            if (chunkText) {
                fullResponseText += chunkText;
                setHistory(prev => prev.map(chat => {
                    if (chat.id === activeChatId) {
                        const updatedMessages = [...chat.messages];
                        const lastMessage = updatedMessages[updatedMessages.length - 1];
                        if (lastMessage && lastMessage.sender === 'ai') {
                            lastMessage.text = fullResponseText;
                        }
                        return { ...chat, messages: updatedMessages };
                    }
                    return chat;
                }));
            }

            const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (groundingChunks) {
                const sources: GroundingSource[] = groundingChunks
                    ?.map((c: any) => ({ uri: c.web?.uri || '', title: c.web?.title || '' }))
                    .filter((source): source is GroundingSource => !!source.uri);
                finalSources.push(...sources);
            }
        }
        
        if (finalSources.length > 0) {
            setHistory(prev => prev.map(chat => {
                if (chat.id === activeChatId) {
                    const updatedMessages = [...chat.messages];
                    const lastMessage = updatedMessages[updatedMessages.length - 1];
                    if (lastMessage && lastMessage.sender === 'ai') {
                         const uniqueSources = Array.from(new Map(finalSources.map(s => [s.uri, s])).values());
                         lastMessage.sources = uniqueSources;
                    }
                    return { ...chat, messages: updatedMessages };
                }
                return chat;
            }));
        }

    } catch (error) {
        console.error("API error:", error);
        setHistory(prev => prev.map(chat => {
            if (chat.id === activeChatId) {
                const updatedMessages = [...chat.messages];
                const lastMessage = updatedMessages[updatedMessages.length - 1];
                if (lastMessage && lastMessage.sender === 'ai') {
                    lastMessage.text = "A temporal distortion occurred. I couldn't process that. Please try again.";
                }
                return { ...chat, messages: updatedMessages };
            }
            return chat;
        }));
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleSaveTranscript = () => {
    if (!activeChat) return;
    const transcript = activeChat.messages
      .map(msg => `${msg.sender.toUpperCase()} [${new Date(msg.timestamp).toLocaleString()}]:\n${msg.text}`)
      .join('\n\n');
    const blob = new Blob([transcript], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `future-lens-transcript-${activeChat.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex w-full h-[90vh] relative">
        <Sidebar
          isOpen={isSidebarOpen}
          setIsOpen={setSidebarOpen}
          userData={userData}
          history={filteredHistory}
          activeChatId={activeChatId}
          onNewChat={handleNewChat}
          onSelectChat={setActiveChatId}
          onDeleteChat={handleDeleteChat}
          onSaveTranscript={handleSaveTranscript}
          onStartOver={onStartOver}
          currentTheme={theme}
          setTheme={setTheme}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-80' : 'ml-0'}`}>
          <GlassCard className="w-full h-full flex flex-col p-0">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h1 className="text-2xl font-bold font-orbitron text-white">{activeChat?.title || "Conversation"}</h1>
            </div>
            <div ref={chatContainerRef} data-scroll-container className="flex-grow p-6 overflow-y-auto space-y-6">
              {activeChat?.messages.map((msg, index) => (
                <div key={index} className={`flex items-end gap-3 animate-fade-in-up ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'ai' && <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--glow-1-hex)] to-[var(--glow-2-hex)] flex-shrink-0 shadow-lg" style={{ boxShadow: '0 0 15px var(--glow-1-hex)'}}></div>}
                  <div className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-md lg:max-w-lg px-5 py-3 rounded-2xl shadow-lg text-white/90 ${msg.sender === 'user' ? 'bg-gradient-to-br from-[var(--user-bubble-start)] to-[var(--user-bubble-end)] rounded-br-none' : 'bg-gradient-to-br from-[var(--ai-bubble-start)] to-[var(--ai-bubble-end)] rounded-bl-none'}`}>
                      <p className="whitespace-pre-wrap leading-relaxed">
                        {msg.text}
                        {!msg.text && msg.sender === 'ai' && isLoading && index === activeChat.messages.length - 1 && (
                          <div className="flex space-x-1.5">
                            <div className="w-2.5 h-2.5 bg-cyan-200/50 rounded-full animate-pulse"></div>
                            <div className="w-2.5 h-2.5 bg-cyan-200/50 rounded-full animate-pulse [animation-delay:0.2s]"></div>
                            <div className="w-2.5 h-2.5 bg-cyan-200/50 rounded-full animate-pulse [animation-delay:0.4s]"></div>
                          </div>
                        )}
                      </p>
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/20 text-xs">
                          <p className="font-semibold text-gray-300 mb-1">Sources:</p>
                          <ul className="space-y-1">
                            {msg.sources.map((source, i) => (
                              <li key={i} className="flex items-center gap-2">
                                <GlobeIcon className="w-3 h-3 text-gray-400 flex-shrink-0"/> 
                                <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[var(--text-accent)] hover:underline truncate" title={source.title}>
                                  {source.title || new URL(source.uri).hostname}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 px-1">
                      {msg.timestamp && <p className="text-xs text-gray-500">{formatTimeAgo(msg.timestamp)}</p>}
                      {msg.sender === 'ai' && <button onClick={() => handleSpeak(msg.text, index)} className="text-gray-400 hover:text-[var(--text-accent)] transition-colors" aria-label={currentlySpeakingIndex === index ? "Stop speaking" : "Read message aloud"}>{currentlySpeakingIndex === index ? <SpeakerXMarkIcon className="w-4 h-4" /> : <SpeakerWaveIcon className="w-4 h-4" />}</button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                 <div className="relative flex-grow">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder={isRecording ? "Recording..." : "Ask your future self..."} className="w-full bg-black/50 border border-white/20 rounded-lg pl-5 pr-14 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-transparent transition-all input-glow-focus" disabled={isLoading} />
                    <button onClick={handleToggleRecording} disabled={isLoading} className={`absolute inset-y-0 right-4 px-3 flex items-center text-gray-400 hover:text-[var(--text-accent)] transition-all duration-300 disabled:text-gray-600 disabled:cursor-not-allowed ${isRecording ? 'text-[var(--button-accent)] scale-110' : ''}`} aria-label={isRecording ? 'Stop recording' : 'Use microphone'}>
                       <MicrophoneIcon className={`w-6 h-6 transition-transform ${isRecording ? 'animate-pulse' : ''}`} />
                    </button>
                  </div>
                <button onClick={sendMessage} disabled={isLoading || !input.trim()} className="w-12 h-12 flex items-center justify-center bg-[var(--button-accent)] rounded-lg text-black hover:scale-105 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-300 hover:shadow-[0_0_20px_var(--button-accent)]" aria-label="Send message">{isLoading ? <SpinnerIcon className="w-6 h-6" /> : <SendIcon className="w-6 h-6" />}</button>
              </div>
            </div>
          </GlassCard>
        </main>
      </div>
      <AboutModal isOpen={isAboutModalOpen} onClose={() => setAboutModalOpen(false)} />
      <Footer onOpenAbout={() => setAboutModalOpen(true)} />
    </>
  );
};

export default ChatPage;