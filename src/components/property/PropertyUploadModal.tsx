import React, { useState } from 'react';
import { Property } from '../../types';
import { Icons } from '../Icons';
import { Button } from '../ui';
import { optimizeImageForUpload, isValidImageFile } from '../../utils/imageOptimizer';
import * as supabaseService from '../../services/supabaseService';
import { MapLocationPicker } from '../maps/MapLocationPicker'; // Import

interface PropertyUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 1 | 2 | 3 | 4;

export const PropertyUploadModal: React.FC<PropertyUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    coordinates: undefined as { lat: number; lng: number } | undefined, // Add coordinates
    price: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    description: '',
    features: [] as string[],
    imageFiles: [] as File[]
  });

  const [featureInput, setFeatureInput] = useState('');

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    
    if (files.length === 0) return;
    
    // Validate file types
    const invalidFiles = files.filter(f => !isValidImageFile(f));
    if (invalidFiles.length > 0) {
      setError('Solo se permiten imágenes (JPG, PNG, WebP, GIF)');
      return;
    }
    
    // Limit to 10 images
    if (files.length > 10) {
      setError('Máximo 10 imágenes permitidas');
      return;
    }
    
    setFormData(prev => ({ ...prev, imageFiles: files }));
    setError('');
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      imageFiles: prev.imageFiles.filter((_, i) => i !== index)
    }));
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    if (formData.features.length >= 20) {
      setError('Máximo 20 características');
      return;
    }
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, featureInput.trim()]
    }));
    setFeatureInput('');
    setError('');
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: Step): boolean => {
    setError('');
    
    switch (step) {
      case 1:
        if (!formData.title.trim() || formData.title.length < 5) {
          setError('El título debe tener al menos 5 caracteres');
          return false;
        }
        if (!formData.location.trim() || formData.location.length < 3) {
          setError('La ubicación debe tener al menos 3 caracteres');
          return false;
        }
        if (!formData.price || parseInt(formData.price) <= 0) {
          setError('El precio debe ser mayor a 0');
          return false;
        }
        return true;
        
      case 2:
        if (!formData.bedrooms || parseInt(formData.bedrooms) < 0) {
          setError('Número de habitaciones inválido');
          return false;
        }
        if (!formData.bathrooms || parseInt(formData.bathrooms) < 0) {
          setError('Número de baños inválido');
          return false;
        }
        if (!formData.area || parseInt(formData.area) <= 0) {
          setError('El área debe ser mayor a 0');
          return false;
        }
        return true;
        
      case 3:
        if (formData.imageFiles.length === 0) {
          setError('Debes subir al menos 1 imagen');
          return false;
        }
        return true;
        
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4) as Step);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1) as Step);
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsUploading(true);
    setUploadProgress(10);
    
    try {
      // Optimize and Upload images
      const imageUrls: string[] = [];
      const totalImages = formData.imageFiles.length;
      
      for (let i = 0; i < totalImages; i++) {
        const file = formData.imageFiles[i];
        setUploadProgress(Math.round(20 + (i / totalImages) * 60)); // 20% to 80% range for uploads
        
        // 1. Optimize
        const optimizedFile = await optimizeImageForUpload(file, file.name);
        
        // 2. Upload to Storage
        const publicUrl = await supabaseService.uploadPropertyImage(optimizedFile);
        imageUrls.push(publicUrl);
      }
      
      setUploadProgress(85);
      
      // Create property in DB
      const propertyData: Partial<Property> = {
        title: formData.title,
        location: formData.location,
        coordinates: formData.coordinates,
        price: parseInt(formData.price),
        bedrooms: parseInt(formData.bedrooms),
        bathrooms: parseInt(formData.bathrooms),
        area: parseInt(formData.area),
        description: formData.description,
        features: formData.features,
        imageUrls: imageUrls,
        status: 'active',
        rating: 0
      };
      
      setUploadProgress(95);
      await supabaseService.createProperty(propertyData);
      
      setUploadProgress(100);
      
      // Success
      setTimeout(() => {
        onSuccess();
        onClose();
        resetForm();
      }, 500);
      
    } catch (err) {
      console.error('Error creating property:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la propiedad');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      location: '',
      price: '',
      bedrooms: '',
      bathrooms: '',
      area: '',
      description: '',
      features: [],
      imageFiles: []
    });
    setCurrentStep(1);
    setError('');
    setUploadProgress(0);
  };

  const inputClass = "w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all";

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Publicar Propiedad</h2>
            <p className="text-sm text-gray-500 mt-1">Paso {currentStep} de 4</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Icons.Close className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  step <= currentStep ? 'bg-black' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título de la Propiedad *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={inputClass}
                  placeholder="Ej: Apartamento moderno en el centro"
                  maxLength={100}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ubicación *</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={inputClass}
                    placeholder="Ej: Malabo, Bioko Norte (o selecciona en el mapa)"
                    maxLength={100}
                  />
                  <MapLocationPicker 
                    onLocationSelect={(loc) => {
                      setFormData(prev => ({
                        ...prev,
                        coordinates: { lat: loc.lat, lng: loc.lng },
                        location: loc.address || prev.location
                      }));
                    }}
                    initialLocation={formData.coordinates}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio Mensual (FCA) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className={inputClass}
                  placeholder="Ej: 150000"
                  min="0"
                />
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Habitaciones *</label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                    className={inputClass}
                    min="0"
                    max="50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Baños *</label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                    className={inputClass}
                    min="0"
                    max="50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Área (m²) *</label>
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className={inputClass}
                    min="1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={inputClass}
                  rows={4}
                  placeholder="Describe tu propiedad..."
                  maxLength={1000}
                />
                <p className="text-xs text-gray-400 mt-1">{formData.description.length}/1000 caracteres</p>
              </div>
            </div>
          )}

          {/* Step 3: Images */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes de la Propiedad *</label>
                <p className="text-xs text-gray-500 mb-3">Sube entre 1 y 10 imágenes (JPG, PNG, WebP, GIF)</p>
                
                <label className="block w-full border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-black transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Icons.Image className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">Click para seleccionar imágenes</p>
                  <p className="text-xs text-gray-500 mt-1">o arrastra y suelta aquí</p>
                </label>
              </div>
              
              {formData.imageFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {formData.imageFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Icons.Close className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Features */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Características Adicionales</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    className={inputClass}
                    placeholder="Ej: Piscina, Jardín, Garaje..."
                    maxLength={50}
                  />
                  <Button onClick={addFeature} variant="secondary">
                    <Icons.Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              
              {formData.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm"
                    >
                      <span>{feature}</span>
                      <button onClick={() => removeFeature(index)} className="hover:text-red-500">
                        <Icons.Close className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-6">
                <h3 className="font-bold text-gray-900 mb-2">Resumen</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>📍 {formData.location}</p>
                  <p>💰 {parseInt(formData.price).toLocaleString()} FCA/mes</p>
                  <p>🛏️ {formData.bedrooms} hab. • 🚿 {formData.bathrooms} baños • 📐 {formData.area}m²</p>
                  <p>📸 {formData.imageFiles.length} imágenes</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Subiendo propiedad...</span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-black transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-between">
          <Button
            variant="secondary"
            onClick={currentStep === 1 ? onClose : prevStep}
            disabled={isUploading}
          >
            {currentStep === 1 ? 'Cancelar' : 'Anterior'}
          </Button>
          
          {currentStep < 4 ? (
            <Button variant="brand" onClick={nextStep} disabled={isUploading}>
              Siguiente
            </Button>
          ) : (
            <Button variant="brand" onClick={handleSubmit} disabled={isUploading}>
              {isUploading ? 'Publicando...' : 'Publicar Propiedad'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
