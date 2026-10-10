import React, { useState, useEffect } from 'react';
import {
  FileEdit,
  Save,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { WebsiteContent } from '../../types/index.js';

export const ContentManager: React.FC = () => {
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    api.getContent()
      .then(res => {
        setContent(res);
        setLoading(false);
      })
      .catch(err => {
        setErrorMsg(err.message);
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content) return;
    setErrorMsg(null);
    setSavedSuccess(false);

    try {
      const updated = await api.adminUpdateContent(content);
      setContent(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update content');
    }
  };

  if (loading || !content) {
    return <div className="py-20 text-center text-gray-400">Loading website content...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Website Content & Copy Management
          </h1>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
            Edit hero copy, headlines, about us milestones, FAQ questions, and SEO metadata.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1.5 rounded-xl border border-emerald-300">
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Changes saved & live on website!
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 text-red-600 text-xs">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Hero Section */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 sm:p-8 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-neutral-800">
            Hero Section Configuration
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold uppercase text-gray-500 mb-1">Badge Copy</label>
              <input
                type="text"
                value={content.hero.badge}
                onChange={e => setContent({ ...content, hero: { ...content.hero, badge: e.target.value } })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-gray-500 mb-1">Hero Background Image URL</label>
              <input
                type="text"
                value={content.hero.bgImageUrl}
                onChange={e => setContent({ ...content, hero: { ...content.hero, bgImageUrl: e.target.value } })}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold uppercase text-gray-500 mb-1">Main Headline *</label>
            <input
              type="text"
              value={content.hero.headline}
              onChange={e => setContent({ ...content, hero: { ...content.hero, headline: e.target.value } })}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white text-sm font-bold"
            />
          </div>

          <div className="text-xs">
            <label className="block font-bold uppercase text-gray-500 mb-1">Supporting Subheadline</label>
            <textarea
              rows={2}
              value={content.hero.subheadline}
              onChange={e => setContent({ ...content, hero: { ...content.hero, subheadline: e.target.value } })}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Section 2: About Us Metrics */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 sm:p-8 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-neutral-800">
            About Us Metrics & Narrative
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-bold uppercase text-gray-500 mb-1">Cars Detailed</label>
              <input
                type="number"
                value={content.about.carsDetailedCount}
                onChange={e => setContent({ ...content, about: { ...content.about, carsDetailedCount: Number(e.target.value) } })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-gray-500 mb-1">Years Experience</label>
              <input
                type="number"
                value={content.about.experienceYears}
                onChange={e => setContent({ ...content, about: { ...content.about, experienceYears: Number(e.target.value) } })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-gray-500 mb-1">Detailing Team Size</label>
              <input
                type="number"
                value={content.about.teamExpertsCount}
                onChange={e => setContent({ ...content, about: { ...content.about, teamExpertsCount: Number(e.target.value) } })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950"
              />
            </div>

            <div>
              <label className="block font-bold uppercase text-gray-500 mb-1">Satisfaction Rate %</label>
              <input
                type="number"
                value={content.about.satisfactionRate}
                onChange={e => setContent({ ...content, about: { ...content.about, satisfactionRate: Number(e.target.value) } })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Frequently Asked Questions */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 sm:p-8 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              FAQ Questions & Answers
            </h2>
            <button
              type="button"
              onClick={() => {
                setContent({
                  ...content,
                  faq: [...content.faq, { question: 'New Question?', answer: 'Answer details...' }]
                });
              }}
              className="text-xs font-bold text-sky-500 hover:underline flex items-center"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add FAQ
            </button>
          </div>

          <div className="space-y-4">
            {content.faq.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-400">Question #{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...content.faq];
                      updated.splice(idx, 1);
                      setContent({ ...content, faq: updated });
                    }}
                    className="text-rose-500 hover:underline"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={item.question}
                  onChange={e => {
                    const updated = [...content.faq];
                    updated[idx].question = e.target.value;
                    setContent({ ...content, faq: updated });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 font-bold"
                />
                <textarea
                  rows={2}
                  value={item.answer}
                  onChange={e => {
                    const updated = [...content.faq];
                    updated[idx].answer = e.target.value;
                    setContent({ ...content, faq: updated });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section 4: SEO Metadata */}
        <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 sm:p-8 space-y-4 shadow-sm text-xs">
          <h2 className="text-base font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-neutral-800">
            SEO & OpenGraph Social Sharing Card
          </h2>

          <div>
            <label className="block font-bold uppercase text-gray-500 mb-1">Browser Page Title</label>
            <input
              type="text"
              value={content.seo.metaTitle}
              onChange={e => setContent({ ...content, seo: { ...content.seo, metaTitle: e.target.value } })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold uppercase text-gray-500 mb-1">Search Engine Meta Description</label>
            <textarea
              rows={2}
              value={content.seo.metaDescription}
              onChange={e => setContent({ ...content, seo: { ...content.seo, metaDescription: e.target.value } })}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end sticky bottom-6 z-20">
          <button
            type="submit"
            className="px-8 py-3.5 rounded-xl font-bold text-sm text-white bg-sky-600 hover:bg-sky-500 shadow-xl shadow-sky-600/30 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Website Content
          </button>
        </div>
      </form>
    </div>
  );
};
