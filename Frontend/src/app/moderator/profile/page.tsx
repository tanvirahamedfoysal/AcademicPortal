'use client';

import { useState, useEffect } from 'react';
import { Loader2, User, Lock, Save, Shield, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProfileSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  const [profileForm, setProfileForm] = useState({ name: '', email: '', role: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/users/me'); 
      if (res.ok) {
        const data = await res.json();
        setProfileForm({ 
          name: data.name || '', 
          email: data.email || '', 
          role: data.role || 'Moderator' 
        });
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/v1/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: profileForm.name }) 
      });

      if (res.ok) {
        setProfileMessage({ type: 'success', text: 'Profile updated successfully.' });
        setTimeout(() => setProfileMessage({ type: '', text: '' }), 3000);
      } else {
        setProfileMessage({ type: 'error', text: 'Failed to update profile.' });
      }
    } catch (error) {
      setProfileMessage({ type: 'error', text: 'An error occurred while saving.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await fetch('/api/v1/users/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword
        })
      });
      
      if (res.ok) {
        setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordMessage({ type: '', text: '' }), 3000);
      } else {
        setPasswordMessage({ type: 'error', text: 'Failed to update password. Check your current password.' });
      }
    } catch (error) {
      setPasswordMessage({ type: 'error', text: 'An error occurred while updating password.' });
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <User className="h-6 w-6 text-indigo-600" />
          Profile Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">Manage your personal information and security preferences.</p>
      </div>

      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <User className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-900">Personal Information</h2>
          </div>
          
          <form onSubmit={handleProfileSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    value={profileForm.email}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg text-sm cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Email addresses cannot be changed manually.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Account Role</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    disabled
                    value={profileForm.role.toUpperCase()}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg text-sm font-medium cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm font-medium">
                {profileMessage.text && (
                  <span className={profileMessage.type === 'error' ? 'text-red-500' : 'text-emerald-500'}>
                    {profileMessage.text}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={isSavingProfile}
                className="flex items-center gap-2 px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isSavingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Lock className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-900">Security</h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="p-6">
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm outline-none transition-all"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm outline-none transition-all"
                  placeholder="Minimum 8 characters"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm outline-none transition-all"
                  placeholder="Re-type new password"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm font-medium">
                {passwordMessage.text && (
                  <span className={passwordMessage.type === 'error' ? 'text-red-500' : 'text-emerald-500'}>
                    {passwordMessage.text}
                  </span>
                )}
              </div>
              <button
                type="submit"
                disabled={isSavingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
                className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isSavingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                Update Password
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}