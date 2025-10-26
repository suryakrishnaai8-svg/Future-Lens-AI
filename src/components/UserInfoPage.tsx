import React, { useState } from 'react';
import type { UserData } from '../types';
import GlassCard from './common/GlassCard';
import NeonButton from './common/NeonButton';

interface UserInfoPageProps {
  userData: Omit<UserData, 'age' | 'gender' | 'goals' | 'fears' | 'personality' | 'philosophy' | 'hobbies' | 'roleModels' | 'pastExperiences' | 'upcomingEvents'>;
  onSubmit: (data: UserData) => void;
}

const ChevronUpIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
    </svg>
);
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

const UserInfoPage: React.FC<UserInfoPageProps> = ({ userData, onSubmit }) => {
  const [formData, setFormData] = useState<Omit<UserData, 'name' | 'email'>>({
    age: '',
    gender: '',
    goals: '',
    fears: '',
    personality: 'motivational',
    philosophy: '',
    hobbies: '',
    roleModels: '',
    pastExperiences: '',
    upcomingEvents: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'age') {
        // Allow empty string to clear the field, but prevent non-numeric and out-of-range values
        if (value === '' || (/^\d+$/.test(value) && parseInt(value, 10) >= 1 && parseInt(value, 10) <= 150)) {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAgeArrowClick = (increment: number) => {
    setFormData(prev => {
        const currentAge = parseInt(prev.age, 10) || 0;
        let newAge = currentAge + increment;
        if (newAge < 1) newAge = 1;
        if (newAge > 150) newAge = 150;
        return { ...prev, age: newAge.toString() };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...userData, ...formData });
  };

  const formFields = [
    { name: 'goals', placeholder: 'Goals and Ambitions', type: 'textarea' },
    { name: 'fears', placeholder: 'Fears or Challenges', type: 'textarea' },
    { name: 'philosophy', placeholder: 'Beliefs or Philosophy', type: 'textarea' },
    { name: 'hobbies', placeholder: 'Hobbies or Interests', type: 'textarea' },
    { name: 'roleModels', placeholder: 'Role Models', type: 'textarea' },
    { name: 'pastExperiences', placeholder: 'Significant Past Experiences', type: 'textarea' },
    { name: 'upcomingEvents', placeholder: 'Upcoming Events or Plans', type: 'textarea' },
  ];
  
  return (
    <GlassCard>
      <div className="p-8">
        <h1 className="text-3xl font-bold font-orbitron text-cyber-gradient text-glow mb-2">Create Your Future Self</h1>
        <p className="text-purple-300 mb-8">Tell me about your present so I can shape your future.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
          <div className="relative">
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="Age"
              className="w-full bg-black/30 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-transparent transition-all input-glow-focus [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              required
              min="1"
              max="150"
            />
            <div className="absolute inset-y-0 right-0 flex flex-col items-center justify-center pr-2">
                <button type="button" onClick={() => handleAgeArrowClick(1)} className="h-1/2 px-2 text-gray-400 hover:text-[var(--text-accent)]" aria-label="Increase age">
                    <ChevronUpIcon className="w-3 h-3" />
                </button>
                <button type="button" onClick={() => handleAgeArrowClick(-1)} className="h-1/2 px-2 text-gray-400 hover:text-[var(--text-accent)]" aria-label="Decrease age">
                    <ChevronDownIcon className="w-3 h-3" />
                </button>
            </div>
          </div>
          
          <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full bg-black/30 border border-purple-500/50 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-transparent transition-all input-glow-focus ${formData.gender === '' ? 'text-gray-400' : 'text-white'}`}
              required
            >
              <option value="" disabled>Select Gender...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>

          {formFields.map(field => (
            <textarea
              key={field.name}
              name={field.name}
              value={formData[field.name as keyof typeof formData] as string}
              onChange={handleChange}
              placeholder={field.placeholder}
              rows={2}
              className="w-full bg-black/30 border border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-transparent transition-all input-glow-focus"
              required
            />
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Personality Tone</label>
            <select
              name="personality"
              value={formData.personality}
              onChange={handleChange}
              className="w-full bg-black/30 border border-purple-500/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-transparent transition-all input-glow-focus"
            >
              <option value="motivational">Motivational</option>
              <option value="calm">Calm</option>
              <option value="funny">Funny</option>
              <option value="friendly">Friendly</option>
              <option value="realistic">Realistic</option>
            </select>
          </div>

          <div className="pt-4">
            <NeonButton type="submit" className="w-full">
              Awaken Future Self
            </NeonButton>
          </div>
        </form>
      </div>
    </GlassCard>
  );
};

export default UserInfoPage;