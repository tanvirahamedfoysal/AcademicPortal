'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, User, Mail, Shield, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  username: string; 
  email: string;
  user_role: string;
  avatar_url?: string;
}

export default function AdminProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [profileData, setProfileData] = useState<UserProfile>({
    id: '',
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    user_role: 'ADMIN'
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/v1/profile/me');
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: '', type: '' });

    const payload = {
      first_name: profileData.first_name,
      last_name: profileData.last_name,
    };

    try {
      const res = await fetch('/api/v1/profile/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to update profile');
      
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Error updating profile.', type: 'error' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your personal account details.</p>
        </div>
        
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
          >
            {message.text}
          </motion.div>
        )}
      </div>

      <motion.form 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit} 
        className="space-y-6 bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm"
      >
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 mb-6">
          <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
            {profileData.first_name.charAt(0)}{profileData.last_name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              {profileData.first_name} {profileData.last_name}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
              <Shield className="h-4 w-4 text-emerald-600" />
              <span>Role: <strong className="text-slate-700">{profileData.user_role}</strong></span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" name="first_name" value={profileData.first_name} onChange={handleInputChange} required
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-colors"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" name="last_name" value={profileData.last_name} onChange={handleInputChange} required
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-colors"
              />
            </div>
          </div>

          {}
          <div>
            <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1">
              Username
              <Lock className="h-3 w-3 text-slate-400" />
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-medium">@</span>
              <input 
                type="text" value={profileData.username} disabled
                className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-500 text-sm cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Username cannot be changed.</p>
          </div>

          <div>
            <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-1">
              Email Address
              <Lock className="h-3 w-3 text-slate-400" />
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="email" value={profileData.email} disabled
                className="w-full pl-9 pr-3 py-2 border border-slate-200 bg-slate-50 rounded-lg text-slate-500 text-sm cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">Contact support to change email.</p>
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-colors disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {isSaving ? 'Saving...' : 'Update Profile'}
          </button>
        </div>
      </motion.form>
    </div>
  );
}