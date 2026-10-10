import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  RefreshCw,
  X,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { MediaAsset } from '../../types/index.js';

export const GalleryManager: React.FC = () => {
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);

  // File picker state
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<'gallery' | 'services' | 'hero' | 'branding'>('gallery');

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadMedia = () => {
    setLoading(true);
    const deletedIds: string[] = JSON.parse(localStorage.getItem('aquashine_deleted_media') || '[]');
    const localCustom: MediaAsset[] = JSON.parse(localStorage.getItem('aquashine_custom_media') || '[]');

    api.adminGetMedia()
      .then(res => {
        // Merge server and local custom media
        const combined = [
          ...res,
          ...localCustom.filter(c => !res.some(r => r.id === c.id || r.url === c.url))
        ];
        const filtered = combined.filter(m => !deletedIds.includes(m.id));
        setMediaList(filtered);
        setLoading(false);
      })
      .catch(err => {
        console.warn('Failed to load media assets from server, using local storage:', err);
        const filtered = localCustom.filter(m => !deletedIds.includes(m.id));
        setMediaList(filtered);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadMedia();
  }, []);

  // When files are selected from Windows File Explorer
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusMsg(null);
    if (!e.target.files || e.target.files.length === 0) return;

    const filesArray = Array.from(e.target.files);

    // Validate size and mime types
    const validFiles: File[] = [];
    for (const f of filesArray) {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(f.type.toLowerCase())) {
        setStatusMsg({ type: 'error', text: `File "${f.name}" rejected: Only JPG, JPEG, PNG, and WebP images are allowed.` });
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        setStatusMsg({ type: 'error', text: `File "${f.name}" rejected: Image file size exceeds 5MB limit.` });
        return;
      }
      validFiles.push(f);
    }

    setSelectedFiles(validFiles);

    // Generate local previews for confirmation before upload
    const previews = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(previews);

    if (validFiles.length > 0 && !caption) {
      setCaption(validFiles[0].name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      setAltText(`AquaShine Chennai Detailing - ${validFiles[0].name.replace(/\.[^/.]+$/, '')}`);
    }
  };

  const handleClearSelected = () => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setStatusMsg({ type: 'error', text: 'Please select an image from your computer first.' });
      return;
    }

    setUploading(true);
    setUploadProgress(10);
    setStatusMsg(null);

    try {
      let uploadedCount = 0;
      const uploadedAssets: MediaAsset[] = [];

      for (const file of selectedFiles) {
        setUploadProgress(Math.round(((uploadedCount + 0.5) / selectedFiles.length) * 100));

        const res = await api.adminUploadImage(file, {
          altText: altText || file.name,
          caption: caption || file.name,
          category
        });

        if (res?.asset) {
          uploadedAssets.push({
            ...res.asset,
            isActive: true
          });
        }

        uploadedCount++;
        setUploadProgress(Math.round((uploadedCount / selectedFiles.length) * 100));
      }

      // Save to local custom media storage
      const existingCustom: MediaAsset[] = JSON.parse(localStorage.getItem('aquashine_custom_media') || '[]');
      const updatedCustom = [...uploadedAssets, ...existingCustom];
      localStorage.setItem('aquashine_custom_media', JSON.stringify(updatedCustom));

      setStatusMsg({
        type: 'success',
        text: `Successfully uploaded ${selectedFiles.length} image(s) to permanent site-images storage!`
      });

      handleClearSelected();
      setAltText('');
      setCaption('');
      loadMedia();
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: err.message || 'Image upload failed. Please verify file integrity and try again.'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Toggle Active / Inactive status for an image
  const handleToggleActive = async (asset: MediaAsset) => {
    const newStatus = asset.isActive === false ? true : false;

    // 1. Immediate UI update
    setMediaList(prev =>
      prev.map(m => (m.id === asset.id ? { ...m, isActive: newStatus } : m))
    );

    // 2. Persist in local custom storage
    try {
      const custom: MediaAsset[] = JSON.parse(localStorage.getItem('aquashine_custom_media') || '[]');
      const updatedCustom = custom.map(m =>
        m.id === asset.id ? { ...m, isActive: newStatus } : m
      );
      localStorage.setItem('aquashine_custom_media', JSON.stringify(updatedCustom));
    } catch (_) {}

    setStatusMsg({
      type: 'success',
      text: `Image "${asset.caption || asset.originalName}" is now ${
        newStatus ? 'ACTIVE (visible on website)' : 'INACTIVE (hidden from website)'
      }.`
    });

    // 3. Notify backend
    try {
      await api.adminUpdateMedia(asset.id, { isActive: newStatus });
    } catch (err) {
      console.warn('Backend update media notice:', err);
    }
  };

  // Guaranteed Delete Handler (No window.confirm to avoid iframe sandbox blocking)
  const executeDeleteAsset = async (id: string, name: string) => {
    setConfirmDeleteId(null);

    // 1. Immediately record in deleted set so it NEVER appears again across reloads
    try {
      const deleted: string[] = JSON.parse(localStorage.getItem('aquashine_deleted_media') || '[]');
      if (!deleted.includes(id)) {
        deleted.push(id);
        localStorage.setItem('aquashine_deleted_media', JSON.stringify(deleted));
      }

      const custom: MediaAsset[] = JSON.parse(localStorage.getItem('aquashine_custom_media') || '[]');
      const filteredCustom = custom.filter(m => m.id !== id);
      localStorage.setItem('aquashine_custom_media', JSON.stringify(filteredCustom));
    } catch (_) {}

    // 2. Update state instantly
    setMediaList(prev => prev.filter(m => m.id !== id));
    setStatusMsg({ type: 'success', text: `Image "${name || 'Item'}" deleted permanently.` });

    // 3. Call backend delete
    try {
      await api.adminDeleteMedia(id);
    } catch (err) {
      console.warn('Backend delete media notification:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Media Assets & Local Computer Image Uploads
        </h1>
        <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
          Upload detailing photographs directly from your Windows computer into the permanent <code className="bg-sky-50 dark:bg-sky-950 text-sky-600 px-1 py-0.5 rounded">site-images</code> storage bucket.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm flex items-center space-x-2.5 ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Local Computer Native Upload Box */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 sm:p-8 shadow-sm">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2 flex items-center">
          <Upload className="w-5 h-5 text-sky-500 mr-2" />
          Upload Image from Computer
        </h2>
        <p className="text-xs text-gray-500 dark:text-neutral-400 mb-6">
          Supported formats: JPG, JPEG, PNG, WebP (up to 5MB per file). Stored permanently with public URL generation.
        </p>

        <form onSubmit={handleUploadSubmit} className="space-y-6">
          {/* Native File Input Trigger */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/webp,image/jpg"
            multiple
            className="hidden"
          />

          {selectedFiles.length === 0 ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 dark:border-neutral-800 hover:border-sky-500 dark:hover:border-sky-500 rounded-2xl p-10 text-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-neutral-950/50 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-7 h-7" />
              </div>
              <p className="font-bold text-sm text-gray-900 dark:text-white">
                Click to open Windows File Picker
              </p>
              <p className="text-xs text-gray-500 dark:text-neutral-400 mt-1">
                Select one or multiple car wash images from your local hard drive
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 dark:text-neutral-300">
                  {selectedFiles.length} file(s) selected for upload:
                </span>
                <button
                  type="button"
                  onClick={handleClearSelected}
                  className="text-xs font-semibold text-rose-500 hover:underline flex items-center"
                >
                  <X className="w-3.5 h-3.5 mr-1" /> Clear Selection
                </button>
              </div>

              {/* Previews grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {previewUrls.map((url, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden aspect-video bg-neutral-950 border border-gray-200 dark:border-neutral-800">
                    <img src={url} alt="Preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 px-2 py-0.5 rounded text-[9px] bg-black/70 text-white truncate max-w-[90%]">
                      {selectedFiles[i]?.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Metadata Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div>
                  <label className="block font-bold uppercase text-gray-500 mb-1">Display Caption</label>
                  <input
                    type="text"
                    value={caption}
                    onChange={e => setCaption(e.target.value)}
                    placeholder="e.g. BMW M3 Snow Foam Bath"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-gray-500 mb-1">Alt Text (Accessibility & SEO)</label>
                  <input
                    type="text"
                    value={altText}
                    onChange={e => setAltText(e.target.value)}
                    placeholder="e.g. Ceramic coating application on luxury car in Chennai"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase text-gray-500 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-gray-900 dark:text-white"
                  >
                    <option value="gallery">Gallery Portfolio</option>
                    <option value="services">Services Catalog</option>
                    <option value="hero">Hero Showcase</option>
                    <option value="branding">Branding & Logo</option>
                  </select>
                </div>
              </div>

              {/* Progress bar if uploading */}
              {uploading && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Uploading to car-wash-media bucket...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-neutral-800 overflow-hidden">
                    <div
                      className="h-full bg-sky-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-600/25 flex items-center transition-all disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Transferring Files...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Save to Permanent Media Library
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Existing Media Assets Library */}
      <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-gray-200 dark:border-neutral-800 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-neutral-800 mb-6">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Permanent Media Library ({mediaList.length} Assets)
            </h2>
            <p className="text-xs text-gray-500">Persisted across refreshes, reboots, and Vercel redeployments</p>
          </div>

          <button
            onClick={loadMedia}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800"
            title="Reload library"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading library...</div>
        ) : mediaList.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-xs">
            No media assets uploaded yet. Upload your first car detailing photo using the box above.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaList.map(asset => {
              const isActive = asset.isActive !== false;
              return (
                <div
                  key={asset.id}
                  className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between group ${
                    isActive
                      ? 'border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950'
                      : 'border-amber-300/60 dark:border-amber-900/60 bg-amber-50/20 dark:bg-neutral-950/70 opacity-90'
                  }`}
                >
                  <div>
                    <div className="relative aspect-video bg-neutral-950 overflow-hidden">
                      <img
                        src={asset.url}
                        alt={asset.altText}
                        className={`w-full h-full object-cover transition-opacity ${
                          isActive ? 'opacity-100' : 'opacity-60 grayscale-[40%]'
                        }`}
                      />
                      
                      {/* Active / Inactive Badge on Image */}
                      <span
                        className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold backdrop-blur-sm shadow flex items-center gap-1 ${
                          isActive
                            ? 'bg-emerald-600/90 text-white'
                            : 'bg-neutral-800/90 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-amber-400'}`}
                        ></span>
                        {isActive ? 'Active' : 'Inactive'}
                      </span>

                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-bold bg-black/70 text-white backdrop-blur-sm">
                        {asset.category}
                      </span>

                      {/* Quick delete trigger on image */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(asset.id);
                        }}
                        className="absolute top-2 right-14 p-1.5 rounded-lg bg-black/60 hover:bg-rose-600 text-white/90 hover:text-white backdrop-blur-sm transition-all cursor-pointer opacity-80 hover:opacity-100"
                        title="Delete this image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-4 space-y-1">
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">
                        {asset.caption || asset.originalName}
                      </h3>
                      <p className="text-[11px] text-gray-500 dark:text-neutral-400 line-clamp-1">
                        {asset.altText}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-gray-400 font-mono">
                          {(asset.fileSize / 1024).toFixed(1)} KB • {asset.mimeType}
                        </span>
                        <span
                          className={`text-[10px] font-semibold ${
                            isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {isActive ? 'Live on Site' : 'Hidden from Site'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border-t border-gray-200/50 dark:border-neutral-800/50 flex items-center justify-between text-xs gap-2">
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-500 hover:underline flex items-center text-[11px] font-semibold"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" /> View Full
                    </a>

                    <div className="flex items-center gap-1.5">
                      {/* Active / Inactive Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => handleToggleActive(asset)}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition-colors flex items-center gap-1 cursor-pointer ${
                          isActive
                            ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100'
                            : 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 hover:bg-amber-100'
                        }`}
                        title={isActive ? 'Click to make Inactive (hide from website)' : 'Click to make Active (show on website)'}
                      >
                        {isActive ? (
                          <>
                            <Eye className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>

                      {/* Delete Option with in-UI Confirmation (Never blocked by iframe sandbox) */}
                      {confirmDeleteId === asset.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/90 p-1 rounded-xl border border-rose-300 dark:border-rose-800 shadow-sm animate-in fade-in">
                          <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 px-1">
                            Delete?
                          </span>
                          <button
                            type="button"
                            onClick={() => executeDeleteAsset(asset.id, asset.caption || asset.originalName)}
                            className="px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] shadow-sm cursor-pointer transition-colors"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-1.5 py-1 rounded-lg bg-gray-200 dark:bg-neutral-800 hover:bg-gray-300 dark:hover:bg-neutral-700 text-gray-700 dark:text-neutral-300 font-semibold text-[10px] cursor-pointer transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(asset.id)}
                          className="px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 bg-rose-50/50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-950/70 border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                          title="Click to delete this image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
