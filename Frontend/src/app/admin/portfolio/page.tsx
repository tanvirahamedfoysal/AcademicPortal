'use client';

import { useState, useEffect } from 'react';
import { Save, Loader2, Link as LinkIcon, BookOpen, User, Building2 } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

interface PortfolioData {
  school: string;
  college: string;
  public_bio: string;
  research_description: string;
  research_interests: string;
  email: string;
  phone: string;
  github_url: string;
  orcid_url: string;
  researchgate_url: string;
  google_scholar_url: string;
  cv_url: string;
  discord_url: string;
  linkedin_url: string;
  facebook_url: string;
  x_url: string;
  instagram_url: string;
}

export default function AdminPortfolioPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [formData, setFormData] = useState<PortfolioData>({
    school: '', college: '', public_bio: '', research_description: '', research_interests: '',
    email: '', phone: '', github_url: '', orcid_url: '', researchgate_url: '', google_scholar_url: '',
    cv_url: '', discord_url: '', linkedin_url: '', facebook_url: '', x_url: '', instagram_url: ''
  });

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const res = await fetch('/api/v1/portfolio');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.research_interests)) {
          data.research_interests = data.research_interests.join(', ');
        }
        setFormData(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error("Failed to fetch portfolio:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: '', type: '' });

    const payload = {
      ...formData,
      research_interests: formData.research_interests.split(',').map(i => i.trim()).filter(Boolean)
    };

    try {
      const res = await fetch('/api/v1/portfolio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to update portfolio');
      
      setMessage({ text: 'Portfolio updated successfully!', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Error updating portfolio.', type: 'error' });
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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

const itemVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 24 
    } 
  }
};

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Portfolio Details</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your public information, biography, and social links.</p>
        </div>
        
        {message.text && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
          >
            {message.text}
          </motion.div>
        )}
      </div>

      <motion.form 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        onSubmit={handleSubmit} 
        className="space-y-8"
      >
        {}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-blue-600" /> Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Public Bio</label>
              <textarea 
                name="public_bio" value={formData.public_bio} onChange={handleInputChange} rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                <input 
                  type="email" name="email" value={formData.email} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <input 
                  type="text" name="phone" value={formData.phone} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-blue-600" /> Academic & Research
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">School</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text" name="school" value={formData.school} onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">College</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text" name="college" value={formData.college} onChange={handleInputChange}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Research Description</label>
              <textarea 
                name="research_description" value={formData.research_description} onChange={handleInputChange} rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Research Interests (Comma separated)</label>
              <input 
                type="text" name="research_interests" value={formData.research_interests} onChange={handleInputChange}
                placeholder="AI, Machine Learning, Web Development"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
              />
            </div>
          </div>
        </motion.div>

        {}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
            <LinkIcon className="h-5 w-5 text-blue-600" /> Links & Socials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['github_url', 'orcid_url', 'google_scholar_url', 'researchgate_url', 'linkedin_url', 'cv_url', 'x_url', 'facebook_url', 'instagram_url', 'discord_url'].map((field) => (
              <div key={field}>
                <label className="block text-xs font-medium text-slate-600 mb-1 capitalize">
                  {field.replace('_url', '').replace('_', ' ')}
                </label>
                <input 
                  type="url" name={field} value={formData[field as keyof PortfolioData] as string} onChange={handleInputChange}
                  placeholder="https://"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                />
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-100 transition-colors disabled:opacity-70"
          >
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </motion.div>
      </motion.form>
    </div>
  );
}