import React, { useState, useEffect, useRef } from 'react';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Upload,
  X,
  Save,
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { ServiceItem, VehicleType } from '../../types/index.js';

export const ServicesManager: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteServiceId, setConfirmDeleteServiceId] = useState<string | null>(null);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Edit / Create Modal State
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadServices = () => {
    setLoading(true);
    api.adminGetServices()
      .then(res => {
        setServices(res);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load admin services:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleToggleActive = async (service: ServiceItem) => {
    try {
      const updated = await api.adminUpdateService(service.id, { isActive: !service.isActive });
      setServices(prev => prev.map(s => (s.id === service.id ? updated : s)));
      setStatusFeedback(`Service "${service.name}" is now ${!service.isActive ? 'Active' : 'Inactive'}.`);
      setTimeout(() => setStatusFeedback(null), 3000);
    } catch (err: any) {
      console.warn('Update status error:', err);
    }
  };

  const executeDeleteService = async (id: string, name: string) => {
    setConfirmDeleteServiceId(null);
    try {
      setServices(prev => prev.filter(s => s.id !== id));
      await api.adminDeleteService(id);
      setStatusFeedback(`Service "${name}" removed successfully.`);
      setTimeout(() => setStatusFeedback(null), 3000);
    } catch (err: any) {
      console.warn('Delete service error:', err);
    }
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    try {
      if (isNew) {
        try {
          await api.adminCreateService({
            name: editingService.name || 'New Detailing Package',
            slug: (editingService.name || 'new-package').toLowerCase().replace(/[^a-z0-9]/g, '-'),
            shortDescription: editingService.shortDescription || '',
            fullDescription: editingService.fullDescription || '',
            category: editingService.category || 'wash',
            imageUrl: editingService.imageUrl || 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=800&q=80',
            basePrice: Number(editingService.basePrice) || 499,
            pricesByVehicle: editingService.pricesByVehicle || {
              hatchback: Number(editingService.basePrice) || 499,
              sedan: Math.round((Number(editingService.basePrice) || 499) * 1.15),
              suv: Math.round((Number(editingService.basePrice) || 499) * 1.35),
              luxury: Math.round((Number(editingService.basePrice) || 499) * 1.6),
              bike: Math.round((Number(editingService.basePrice) || 499) * 0.5)
            },
            estimatedDurationMins: Number(editingService.estimatedDurationMins) || 60,
            discountPercent: Number(editingService.discountPercent) || 0,
            isActive: editingService.isActive ?? true,
            displayOrder: Number(editingService.displayOrder) || services.length + 1,
            features: editingService.features || ['Thorough hand wash', 'Wheel rim clean', 'Glass finish']
          });
        } catch (_) {
          setServices(prev => [editingService as ServiceItem, ...prev]);
        }
      } else {
        try {
          await api.adminUpdateService(editingService.id!, editingService);
        } catch (_) {
          setServices(prev => prev.map(s => s.id === editingService.id ? (editingService as ServiceItem) : s));
        }
      }

      setEditingService(null);
      loadServices();
    } catch (err: any) {
      // Even if network fails, update local state
      if (!isNew && editingService?.id) {
        setServices(prev => prev.map(s => s.id === editingService.id ? (editingService as ServiceItem) : s));
      }
      setEditingService(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
            Services & Pricing Architecture
          </h1>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
            Configure vehicle-specific rates, discounts, duration, and active visibility on the live site.
          </p>
        </div>

        <button
          onClick={() => {
            setIsNew(true);
            setEditingService({
              name: '',
              shortDescription: '',
              fullDescription: '',
              category: 'wash',
              basePrice: 599,
              estimatedDurationMins: 60,
              discountPercent: 0,
              isActive: true,
              imageUrl: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=800&q=80',
              features: ['Complete Foam Wash', 'Wheel Degreasing', 'Microfibre Dry'],
              pricesByVehicle: { hatchback: 499, sedan: 599, suv: 699, luxury: 899, bike: 249 }
            });
          }}
          className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-md shadow-sky-600/25"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Service
        </button>
      </div>

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-20 text-gray-400">Loading service catalog...</div>
        ) : (
          services.map(service => (
            <div
              key={service.id}
              className={`rounded-2xl border p-5 bg-white dark:bg-neutral-900 shadow-sm flex flex-col justify-between transition-all ${
                service.isActive
                  ? 'border-gray-200 dark:border-neutral-800'
                  : 'border-dashed border-gray-300 dark:border-neutral-800 opacity-60'
              }`}
            >
              <div>
                <div className="relative h-40 rounded-xl overflow-hidden bg-neutral-950 mb-4">
                  <img src={service.imageUrl} alt={service.name} className="w-full h-full object-cover" />
                  <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/70 text-white backdrop-blur-sm">
                    {service.category.toUpperCase()}
                  </span>
                  {service.discountPercent ? (
                    <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500 text-white">
                      {service.discountPercent}% OFF
                    </span>
                  ) : null}
                </div>

                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">{service.name}</h3>
                  <button
                    onClick={() => handleToggleActive(service)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      service.isActive
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                        : 'bg-gray-100 dark:bg-neutral-800 text-gray-500'
                    }`}
                  >
                    {service.isActive ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1 line-clamp-2">
                  {service.shortDescription}
                </p>

                {/* Pricing Grid */}
                <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-neutral-950 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">~{service.estimatedDurationMins} Mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Hatch / Sedan:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₹{service.pricesByVehicle?.hatchback || service.basePrice} / ₹{service.pricesByVehicle?.sedan || service.basePrice}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">SUV / Luxury:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ₹{service.pricesByVehicle?.suv || service.basePrice} / ₹{service.pricesByVehicle?.luxury || service.basePrice}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-xs font-black text-sky-600 dark:text-sky-400">
                  Base ₹{service.basePrice}
                </span>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => {
                      setIsNew(false);
                      setEditingService(service);
                    }}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-sky-500 hover:bg-gray-100 dark:hover:bg-neutral-800"
                    title="Edit Service"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {confirmDeleteServiceId === service.id ? (
                    <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950 p-1 rounded-lg border border-rose-300 dark:border-rose-800">
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">Delete?</span>
                      <button
                        type="button"
                        onClick={() => executeDeleteService(service.id, service.name)}
                        className="px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px]"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteServiceId(null)}
                        className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-neutral-800 text-[10px]"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteServiceId(service.id)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-rose-500 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer"
                      title="Archive or Delete Service"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit / Create Modal */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-neutral-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {isNew ? 'Create New Service' : 'Edit Detailing Service'}
              </h3>
              <button onClick={() => setEditingService(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase text-gray-500 mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  value={editingService.name || ''}
                  onChange={e => setEditingService({ ...editingService, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white text-sm"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-gray-500 mb-1">Short Description *</label>
                <input
                  type="text"
                  required
                  value={editingService.shortDescription || ''}
                  onChange={e => setEditingService({ ...editingService, shortDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold uppercase text-gray-500 mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={editingService.fullDescription || ''}
                  onChange={e => setEditingService({ ...editingService, fullDescription: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold uppercase text-gray-500 mb-1">Category</label>
                  <select
                    value={editingService.category || 'wash'}
                    onChange={e => setEditingService({ ...editingService, category: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white"
                  >
                    <option value="wash">Wash</option>
                    <option value="detailing">Detailing</option>
                    <option value="protection">Protection / Ceramic</option>
                    <option value="specialty">Specialty</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase text-gray-500 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    value={editingService.estimatedDurationMins || 60}
                    onChange={e => setEditingService({ ...editingService, estimatedDurationMins: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-gray-500 mb-1">Discount %</label>
                  <input
                    type="number"
                    value={editingService.discountPercent || 0}
                    onChange={e => setEditingService({ ...editingService, discountPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Vehicle Pricing Configuration */}
              <div>
                <label className="block font-bold uppercase text-gray-500 mb-1.5">Vehicle-Specific Pricing (INR)</label>
                <div className="grid grid-cols-5 gap-2">
                  {(['hatchback', 'sedan', 'suv', 'luxury', 'bike'] as VehicleType[]).map(vt => (
                    <div key={vt}>
                      <span className="block text-[10px] uppercase font-bold text-gray-400">{vt}</span>
                      <input
                        type="number"
                        value={editingService.pricesByVehicle?.[vt] || editingService.basePrice || 0}
                        onChange={e => {
                          const val = Number(e.target.value);
                          setEditingService({
                            ...editingService,
                            pricesByVehicle: {
                              ...editingService.pricesByVehicle!,
                              [vt]: val
                            }
                          });
                        }}
                        className="w-full px-2 py-1.5 rounded-lg border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Service Image (Direct Computer Upload or URL) */}
              <div>
                <label className="block font-bold uppercase text-gray-500 mb-1">
                  Service Image & Upload
                </label>
                
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      value={editingService.imageUrl || ''}
                      onChange={e => setEditingService({ ...editingService, imageUrl: e.target.value })}
                      placeholder="https://... or upload below"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white"
                    />
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    className="hidden"
                    onChange={async (e) => {
                      if (!e.target.files || e.target.files.length === 0) return;
                      const file = e.target.files[0];
                      setUploadingImage(true);
                      try {
                        const uploaded = await api.adminUploadImage(file, {
                          altText: editingService.name || 'AquaShine Service Image',
                          caption: editingService.name || 'Service Detailing Image',
                          category: 'services'
                        });
                        setEditingService(prev => ({ ...prev, imageUrl: uploaded.url }));
                      } catch (err: any) {
                        alert(`Upload failed: ${err.message}`);
                      } finally {
                        setUploadingImage(false);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }
                    }}
                  />

                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-sky-400 font-bold hover:bg-sky-100 flex items-center space-x-1.5 whitespace-nowrap text-xs transition-colors disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload from Computer</span>
                      </>
                    )}
                  </button>
                </div>

                {editingService.imageUrl && (
                  <div className="mt-2.5 flex items-center justify-between p-2 rounded-xl bg-gray-50 dark:bg-neutral-950 border border-gray-100 dark:border-neutral-800">
                    <div className="flex items-center space-x-3">
                      <img
                        src={editingService.imageUrl}
                        alt="Preview"
                        className="w-14 h-14 rounded-lg object-cover border border-gray-200 dark:border-neutral-800"
                      />
                      <div className="text-[11px] truncate text-gray-500 dark:text-neutral-400">
                        <p className="font-semibold text-gray-800 dark:text-neutral-200">Image Attached</p>
                        <p className="truncate max-w-xs">{editingService.imageUrl}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingService(prev => ({ ...prev, imageUrl: '' }))}
                      className="px-2.5 py-1 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      title="Remove service image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 font-bold text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
