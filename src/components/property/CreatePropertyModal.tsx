import React, { useState, useEffect, useRef } from 'react';
import { Property, LocalImage } from '../../types';
import { Icons } from '../Icons';
import { Button } from '../ui';

interface CreatePropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (p: Partial<Property>) => void;
  initialData?: Property | null;
}

export const CreatePropertyModal: React.FC<CreatePropertyModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    description: '',
    features: ''
  });
  
  const [localImages, setLocalImages] = useState<LocalImage[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title,
          location: initialData.location,
          price: initialData.price.toString(),
          bedrooms: initialData.bedrooms.toString(),
          bathrooms: initialData.bathrooms.toString(),
          area: initialData.area ? initialData.area.toString() : '',
          description: initialData.description,
          features: initialData.features.join(', ')
        });
        setLocalImages(initialData.imageUrls.map(url => ({
          id: Math.random().toString(36).substr(2, 9),
          url,
          isUploading: false,
          progress: 100
        })));
      } else {
        setFormData({
          title: '',
          location: '',
          price: '',
          bedrooms: '',
          bathrooms: '',
          area: '',
          description: '',
          features: ''
        });
        setLocalImages([]);
      }
    }
  }, [isOpen, initialData]);

  const addRandomImage = () => {
    const newImage: LocalImage = {
        id: Math.random().toString(36).substr(2, 9),
        url: `https://picsum.photos/800/600?random=${Math.random()}`,
        isUploading: false,
        progress: 100
    };
    setLocalImages([...localImages, newImage]);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const tempId = Math.random().toString(36).substr(2, 9);
      
      const newImage: LocalImage = {
        id: tempId,
        url: '',
        isUploading: true,
        progress: 0
      };
      
      setLocalImages(prev => [...prev, newImage]);

      // Simulate progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setLocalImages(prev => prev.map(img => 
           img.id === tempId ? { ...img, progress: Math.min(progress, 90) } : img
        ));
      }, 100);

      const reader = new FileReader();
      reader.onloadend = () => {
        clearInterval(interval);
        if (typeof reader.result === 'string') {
          setLocalImages(prev => prev.map(img => 
             img.id === tempId ? { 
               ...img, 
               url: reader.result as string, 
               progress: 100, 
               isUploading: false 
             } : img
          ));
        }
      };
      
      setTimeout(() => {
          reader.readAsDataURL(file);
      }, 1000);
    }
    e.target.value = '';
  };

  const removeImage = (id: string) => {
    setLocalImages(localImages.filter((img) => img.id !== id));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
      const newImages = [...localImages];
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      
      if (targetIndex >= 0 && targetIndex < newImages.length) {
          [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]];
          setLocalImages(newImages);
      }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4`}> 
      <div className={`absolute inset-0 bg-black/50`} />
      <div className={`bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar`}>
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{initialData ? 'Editar Propiedad' : 'Publicar Propiedad'}</h2>
            <button onClick={onClose} aria-label="Cerrar modal"><Icons.Close className="w-6 h-6 text-gray-400 hover:text-black transition-colors" /></button>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Título</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Ej. Apartamento luminoso"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Precio (FCA)</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                  placeholder="Ej. 120000"
                  aria-label="Precio mensual en FCA"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ubicación</label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                  placeholder="Ej. Madrid, Centro"
                  aria-label="Ubicación de la propiedad"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hab.</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  value={formData.bedrooms}
                  onChange={e => setFormData({...formData, bedrooms: e.target.value})}
                  placeholder="2"
                  aria-label="Número de habitaciones"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Baños</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  value={formData.bathrooms}
                  onChange={e => setFormData({...formData, bathrooms: e.target.value})}
                  placeholder="1"
                  aria-label="Número de baños"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">m²</label>
                <input 
                  type="number" 
                  className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                  value={formData.area}
                  onChange={e => setFormData({...formData, area: e.target.value})}
                  placeholder="85"
                  aria-label="Superficie en metros cuadrados"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Imágenes</label>
              <div className="space-y-3">
                <div className="flex gap-3 overflow-x-auto py-2 no-scrollbar touch-pan-x">
                  {localImages.map((img, idx) => (
                    <div key={img.id} className="relative flex-shrink-0 w-32 h-32 group rounded-2xl overflow-hidden border border-gray-100">
                      {img.isUploading ? (
                        <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center p-2">
                           <Icons.Image className="w-6 h-6 text-gray-300 mb-2 animate-pulse" />
                           <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div className="bg-green-500 h-1.5 rounded-full transition-all duration-300" style={{width: `${img.progress}%`}}></div>
                           </div>
                           <span className="text-[10px] text-gray-400 mt-1">{img.progress}%</span>
                        </div>
                      ) : (
                        <>
                          <img src={img.url} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                             {idx > 0 && (
                               <button 
                                 onClick={() => moveImage(idx, 'left')} 
                                 className="bg-white/90 p-1.5 rounded-full hover:bg-white text-black"
                                 aria-label="Mover imagen a la izquierda"
                               >
                                 <Icons.ChevronLeft className="w-4 h-4" />
                               </button>
                             )}
                             {idx < localImages.length - 1 && (
                               <button 
                                 onClick={() => moveImage(idx, 'right')} 
                                 className="bg-white/90 p-1.5 rounded-full hover:bg-white text-black"
                                 aria-label="Mover imagen a la derecha"
                               >
                                 <Icons.ChevronRight className="w-4 h-4" />
                               </button>
                             )}
                          </div>
                          <button 
                            onClick={() => removeImage(img.id)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Eliminar imagen"
                          >
                            <Icons.Close className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                    aria-label="Subir imagen de la propiedad"
                  />
                  
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-black hover:text-black hover:bg-gray-50 transition-all flex-shrink-0"
                  >
                    <Icons.Image className="w-8 h-8 mb-1" />
                    <span className="text-xs font-medium">Subir Foto</span>
                  </button>

                  <button 
                    onClick={addRandomImage}
                    className="w-32 h-32 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-300 hover:border-gray-400 hover:text-gray-500 transition-colors flex-shrink-0"
                  >
                    <Icons.Sparkles className="w-8 h-8 mb-1" />
                    <span className="text-xs">Aleatoria</span>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Características</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-full px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                value={formData.features}
                onChange={e => setFormData({...formData, features: e.target.value})}
                placeholder="Wifi, Balcón, Garaje"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Descripción</label>
              <textarea 
                className="w-full border border-gray-300 rounded-3xl p-4 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all h-32 text-sm"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Descripción detallada..."
              />
            </div>

            <Button 
              onClick={async () => {
                setIsSaving(true);
                await new Promise(resolve => setTimeout(resolve, 1500));
                onSubmit({
                  title: formData.title,
                  price: Number(formData.price),
                  location: formData.location,
                  bedrooms: Number(formData.bedrooms),
                  bathrooms: Number(formData.bathrooms),
                  area: Number(formData.area),
                  description: formData.description,
                  features: formData.features.split(',').map(s => s.trim()),
                  imageUrls: localImages.length > 0 ? localImages.map(img => img.url) : [`https://picsum.photos/800/600?random=${Math.random()}`],
                  isOccupied: false,
                  status: 'active',
                });
                setIsSaving(false);
                onClose();
              }}
              variant="brand"
              className="w-full mt-6 py-3"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   {initialData ? 'Guardando...' : 'Publicando...'}
                </>
              ) : (
                initialData ? 'Guardar Cambios' : 'Publicar Propiedad'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

