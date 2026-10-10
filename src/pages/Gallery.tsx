import React, { useState, useEffect } from 'react';
import { Sparkles, ZoomIn, X, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api.js';
import { MediaAsset } from '../types/index.js';

export const Gallery: React.FC = () => {
  const [media, setMedia] = useState<MediaAsset[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [activeImage, setActiveImage] = useState<MediaAsset | null>(null);

  useEffect(() => {
    api.getGallery().then(setMedia).catch(() => {});
  }, []);

  const defaultShowcase = [
    {
      id: 'd-1',
      url: 'https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=1200&q=80',
      caption: 'Audi R8 V10 Plus undergoing 9H Ceramic Coating at OMR studio',
      altText: 'Audi sportscar ceramic coating in Chennai',
      category: 'protection'
    },
    {
      id: 'd-2',
      url: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1200&q=80',
      caption: 'BMW 3 Series covered in dense pH-neutral snow foam bath',
      altText: 'BMW snow foam wash in Chennai',
      category: 'wash'
    },
    {
      id: 'd-3',
      url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80',
      caption: 'Mercedes-Benz E-Class deep leather extraction & sanitization',
      altText: 'Mercedes leather conditioning',
      category: 'detailing'
    },
    {
      id: 'd-4',
      url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80',
      caption: 'Dual-action rotary machine paint correction eliminating swirls',
      altText: 'Machine paint polish',
      category: 'detailing'
    },
    {
      id: 'd-5',
      url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
      caption: 'Triumph Street Triple superbike wash with Motul chain maintenance',
      altText: 'Superbike wash in Chennai',
      category: 'specialty'
    },
    {
      id: 'd-6',
      url: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=1200&q=80',
      caption: 'Engine bay degreasing with non-conductive electrical protection',
      altText: 'Engine bay detailing',
      category: 'detailing'
    }
  ];

  const allItems = [
    ...media,
    ...defaultShowcase.filter(d => !media.some(m => m.url === d.url))
  ];

  const filtered = allItems.filter(item => {
    if (filter === 'all') return true;
    return item.category === filter;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-neutral-100 py-12 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-500">
            Craftsmanship in Action
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-2 text-gray-900 dark:text-white">
            AquaShine Detailing Portfolio
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-neutral-400">
            Real customer transformations from our multi-bay studio on Rajiv Gandhi IT Expressway (OMR), Chennai.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {[
            { id: 'all', label: 'All Projects' },
            { id: 'protection', label: '9H Ceramic Coating' },
            { id: 'wash', label: 'Foam Washes' },
            { id: 'detailing', label: 'Paint & Interior Detailing' },
            { id: 'specialty', label: 'Superbikes & Luxury' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === tab.id
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/25'
                  : 'bg-gray-100 dark:bg-neutral-900 text-gray-600 dark:text-neutral-400 hover:bg-gray-200 dark:hover:bg-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => (
            <div
              key={item.id}
              onClick={() => setActiveImage(item as any)}
              className="group relative rounded-2xl overflow-hidden bg-neutral-950 aspect-[4/3] cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300"
            >
              <img
                src={item.url}
                alt={item.altText || item.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

              <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                  {item.category?.toUpperCase() || 'DETAILING'}
                </span>
                <p className="text-sm font-bold mt-1 text-white line-clamp-2">
                  {item.caption || item.altText}
                </p>
              </div>

              <div className="absolute top-4 right-4 p-2 rounded-xl bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                <ZoomIn className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox Modal */}
        {activeImage && (
          <div
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveImage(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-neutral-900 rounded-3xl overflow-hidden border border-neutral-800"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveImage(null)}
                className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="max-h-[75vh] bg-black flex items-center justify-center">
                <img
                  src={activeImage.url}
                  alt={activeImage.altText || activeImage.caption}
                  className="max-h-[75vh] w-auto object-contain"
                />
              </div>

              <div className="p-6 bg-neutral-900 text-white flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base">{activeImage.caption || activeImage.altText}</h3>
                  <p className="text-xs text-neutral-400 mt-1">AquaShine Studio • OMR Kandanchavadi, Chennai</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
