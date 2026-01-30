import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../../types';
import { Icons } from '../Icons';
import { Button } from '../ui';
import logo from '../../assets/logo/logo.png';
import { useAuth } from '../../contexts/AuthContext';
import * as supabaseService from '../../services/supabaseService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { signInWithGoogle, loginWithEmail, registerWithEmail, isLoading } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { sendResetPasswordEmail } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client' as UserRole
  });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({});
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [availabilityChecked, setAvailabilityChecked] = useState({
    email: false,
    name: false,
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', email: '', password: '', role: 'client' });
      setError('');
      setSuccessMessage('');
      setValidationErrors({});
      setIsRegistering(false);
      setIsForgotPassword(false);
    }
  }, [isOpen]);

  // Real-time validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateName = (name: string): boolean => {
    return name.trim().length >= 2 && name.trim().length <= 50;
  };

  const validatePassword = (password: string): { valid: boolean; message?: string } => {
    if (password.length < 8) {
      return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'La contraseña debe incluir al menos una mayúscula' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { valid: false, message: 'La contraseña debe incluir al menos un signo (!@#$%, etc)' };
    }
    return { valid: true };
  };

  // Debounced function to check email availability
  const checkEmailAvailability = useCallback(
    async (email: string) => {
      if (!email || !validateEmail(email)) {
        setValidationErrors(prev => ({ ...prev, email: undefined }));
        setAvailabilityChecked(prev => ({ ...prev, email: false }));
        return;
      }

      setIsCheckingAvailability(true);
      try {
        const exists = await supabaseService.checkEmailExists(email);
        if (exists) {
          setValidationErrors(prev => ({ 
            ...prev, 
            email: 'Este email ya está registrado. Por favor, usa otro email o inicia sesión.' 
          }));
        } else {
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            if (newErrors.email?.includes('ya está registrado')) {
              delete newErrors.email;
            }
            return newErrors;
          });
        }
        setAvailabilityChecked(prev => ({ ...prev, email: true }));
      } catch (err) {
        console.error('Error checking email availability:', err);
      } finally {
        setIsCheckingAvailability(false);
      }
    },
    []
  );

  // Debounced function to check name availability
  const checkNameAvailability = useCallback(
    async (name: string) => {
      if (!name || !validateName(name)) {
        setValidationErrors(prev => ({ ...prev, name: undefined }));
        setAvailabilityChecked(prev => ({ ...prev, name: false }));
        return;
      }

      setIsCheckingAvailability(true);
      try {
        const exists = await supabaseService.checkNameExists(name);
        if (exists) {
          setValidationErrors(prev => ({ 
            ...prev, 
            name: 'Este nombre de usuario ya está en uso. Por favor, elige otro nombre.' 
          }));
        } else {
          setValidationErrors(prev => {
            const newErrors = { ...prev };
            if (newErrors.name?.includes('ya está en uso')) {
              delete newErrors.name;
            }
            return newErrors;
          });
        }
        setAvailabilityChecked(prev => ({ ...prev, name: true }));
      } catch (err) {
        console.error('Error checking name availability:', err);
      } finally {
        setIsCheckingAvailability(false);
      }
    },
    []
  );

  // Debounce timers
  useEffect(() => {
    if (!isRegistering) return;

    const emailTimer = setTimeout(() => {
      if (formData.email) {
        checkEmailAvailability(formData.email);
      }
    }, 800); // Wait 800ms after user stops typing

    const nameTimer = setTimeout(() => {
      if (formData.name) {
        checkNameAvailability(formData.name);
      }
    }, 800);

    return () => {
      clearTimeout(emailTimer);
      clearTimeout(nameTimer);
    };
  }, [formData.email, formData.name, isRegistering, checkEmailAvailability, checkNameAvailability]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (isRegistering) {
      // REGISTRATION - Enhanced validation
      setValidationErrors({});
      
      // Validate name
      if (!formData.name.trim()) {
        setValidationErrors(prev => ({ ...prev, name: 'El nombre es obligatorio' }));
        setError('Por favor completa todos los campos correctamente');
        return;
      }
      if (!validateName(formData.name)) {
        setValidationErrors(prev => ({ ...prev, name: 'El nombre debe tener entre 2 y 50 caracteres' }));
        setError('Por favor completa todos los campos correctamente');
        return;
      }

      // Validate email
      if (!formData.email.trim()) {
        setValidationErrors(prev => ({ ...prev, email: 'El email es obligatorio' }));
        setError('Por favor completa todos los campos correctamente');
        return;
      }
      if (!validateEmail(formData.email)) {
        setValidationErrors(prev => ({ ...prev, email: 'Ingresa un email válido' }));
        setError('Por favor completa todos los campos correctamente');
        return;
      }

      // Check if email or name already exists before attempting registration
      setIsCheckingAvailability(true);
      try {
        const availability = await supabaseService.checkUserAvailability(
          formData.email.trim().toLowerCase(),
          formData.name.trim()
        );

        if (!availability.emailAvailable) {
          setValidationErrors(prev => ({ 
            ...prev, 
            email: availability.emailError || 'Este email ya está registrado' 
          }));
          setError(availability.emailError || 'Este email ya está registrado. ¿Quieres iniciar sesión?');
          setIsCheckingAvailability(false);
          return;
        }

        if (!availability.nameAvailable) {
          setValidationErrors(prev => ({ 
            ...prev, 
            name: availability.nameError || 'Este nombre ya está en uso' 
          }));
          setError(availability.nameError || 'Este nombre de usuario ya está en uso. Por favor, elige otro nombre.');
          setIsCheckingAvailability(false);
          return;
        }
      } catch (checkErr) {
        console.error('Error checking user availability:', checkErr);
        // Continue with registration attempt if check fails
      } finally {
        setIsCheckingAvailability(false);
      }

      // Validate password
      if (!formData.password) {
        setValidationErrors(prev => ({ ...prev, password: 'La contraseña es obligatoria' }));
        setError('Por favor completa todos los campos correctamente');
        return;
      }
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.valid) {
        setValidationErrors(prev => ({ ...prev, password: passwordValidation.message }));
        setError(passwordValidation.message || 'La contraseña no cumple los requisitos');
        return;
      }
      
      try {
        setError('');
        await registerWithEmail({ 
          name: formData.name.trim(), 
          email: formData.email.trim().toLowerCase(), 
          role: formData.role,
          password: formData.password
        });
        
        setSuccessMessage('¡Cuenta creada exitosamente! Revisa tu email para confirmar tu cuenta. El enlace de confirmación puede tardar unos minutos en llegar.');
        // Reset form after successful registration
        setTimeout(() => {
          setFormData({ name: '', email: '', password: '', role: 'client' });
          setValidationErrors({});
        }, 2000);
      } catch (err: any) {
        const errorMessage = err.message || 'Error al registrarse';
        
        // Handle specific Supabase errors
        if (errorMessage.includes('already registered') || 
            errorMessage.includes('already exists') ||
            errorMessage.includes('User already registered') ||
            errorMessage.includes('email address is already registered')) {
          setValidationErrors(prev => ({ 
            ...prev, 
            email: 'Este email ya está registrado. Por favor, usa otro email o inicia sesión.' 
          }));
          setError('Este email ya está registrado. ¿Quieres iniciar sesión?');
        } else if (errorMessage.includes('email')) {
          setValidationErrors(prev => ({ ...prev, email: 'Este email no es válido o ya está en uso' }));
          setError('Error con el email proporcionado');
        } else if (errorMessage.includes('name') || errorMessage.includes('username')) {
          setValidationErrors(prev => ({ ...prev, name: 'Este nombre de usuario ya está en uso' }));
          setError('Este nombre de usuario ya está en uso. Por favor, elige otro nombre.');
        } else {
          setError(errorMessage);
        }
      }
    } else if (isForgotPassword) {
      // RESET PASSWORD
      if (!formData.email) {
        setError('Por favor ingresa tu email');
        return;
      }
      try {
        await sendResetPasswordEmail(formData.email);
        setSuccessMessage('Email de recuperación enviado. Revisa tu bandeja de entrada.');
      } catch (err: any) {
        setError(err.message || 'Error al enviar el email');
      }
    } else {
      // LOGIN
      if (!formData.email || !formData.password) {
        setError('Por favor ingresa email y contraseña');
        return;
      }

      try {
        await loginWithEmail(formData.email, formData.password);
        onClose(); // Success
      } catch (err: any) {
        if (err.message === 'VERIFY_EMAIL') {
          setError('Debes confirmar tu correo electrónico para entrar.');
        } else {
          setError('Credenciales inválidas o error de conexión');
        }
      }
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all bg-white text-gray-800 placeholder-gray-400 text-sm";

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm overflow-hidden">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[22rem] relative flex flex-col max-h-[90vh]">
        {/* Close Button - Outside the scrollable area for accessibility */}
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-20 bg-white/80">
          <Icons.Close className="w-5 h-5 text-gray-500" />
        </button>
        
        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="flex flex-col items-center mb-5">
            <div className="mb-3">
               <img src={logo} alt="CasasEG" className="h-24 w-auto object-contain" />
            </div>
            <h1 className="text-xl font-bold text-center text-gray-800">
              {isForgotPassword ? 'Recuperar Cuenta' : isRegistering ? 'Crear Cuenta' : 'Bienvenido de nuevo'}
            </h1>
            <p className="text-center text-gray-500 text-xs mt-1">
              {isForgotPassword ? 'Te enviaremos un email para resetear tu clave' : isRegistering ? 'Únete a la comunidad de CasasEG' : 'Accede a tu cuenta para continuar'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div className="animate-fade-in">
                 <label className="block text-xs font-bold text-gray-600 ml-2 mb-1 uppercase tracking-wider">
                   Nombre Completo
                   {isCheckingAvailability && formData.name && (
                     <span className="ml-2 text-gray-400 text-[10px] normal-case">(verificando...)</span>
                   )}
                 </label>
                 <div className="relative">
                   <input 
                      type="text"
                      className={`${inputClass} ${validationErrors.name ? 'border-red-500 focus:ring-red-500' : availabilityChecked.name && !validationErrors.name ? 'border-green-500 focus:ring-green-500' : ''}`}
                      placeholder="Ej. Juan Pérez"
                      value={formData.name}
                      onChange={e => {
                        setFormData({...formData, name: e.target.value});
                        setAvailabilityChecked(prev => ({ ...prev, name: false }));
                        if (validationErrors.name) {
                          setValidationErrors(prev => ({ ...prev, name: undefined }));
                        }
                      }}
                   />
                   {availabilityChecked.name && !validationErrors.name && formData.name && (
                     <div className="absolute right-3 top-1/2 -translate-y-1/2">
                       <Icons.Check className="w-4 h-4 text-green-500" />
                     </div>
                   )}
                 </div>
                 {validationErrors.name && (
                   <p className="text-red-500 text-xs mt-1 ml-2 flex items-center gap-1">
                     <Icons.Close className="w-3 h-3" />
                     {validationErrors.name}
                   </p>
                 )}
              </div>
            )}

            <div>
               <label className="block text-xs font-bold text-gray-600 ml-2 mb-1 uppercase tracking-wider">
                 Email
                 {isCheckingAvailability && formData.email && (
                   <span className="ml-2 text-gray-400 text-[10px] normal-case">(verificando...)</span>
                 )}
               </label>
               <div className="relative">
                 <input 
                    type="email"
                    className={`${inputClass} ${validationErrors.email ? 'border-red-500 focus:ring-red-500' : availabilityChecked.email && !validationErrors.email && validateEmail(formData.email) ? 'border-green-500 focus:ring-green-500' : ''}`}
                    placeholder="usuario@ejemplo.com"
                    value={formData.email}
                    onChange={e => {
                      setFormData({...formData, email: e.target.value});
                      setAvailabilityChecked(prev => ({ ...prev, email: false }));
                      if (validationErrors.email) {
                        setValidationErrors(prev => ({ ...prev, email: undefined }));
                      }
                    }}
                 />
                 {availabilityChecked.email && !validationErrors.email && validateEmail(formData.email) && (
                   <div className="absolute right-3 top-1/2 -translate-y-1/2">
                     <Icons.Check className="w-4 h-4 text-green-500" />
                   </div>
                 )}
               </div>
               {validationErrors.email && (
                 <p className="text-red-500 text-xs mt-1 ml-2 flex items-center gap-1">
                   <Icons.Close className="w-3 h-3" />
                   {validationErrors.email}
                 </p>
               )}
            </div>

            {!isForgotPassword && (
              <div>
                <label className="block text-xs font-bold text-gray-600 ml-2 mb-1 uppercase tracking-wider">Contraseña</label>
                <div className="relative">
                  <input 
                      type={showPassword ? "text" : "password"}
                      className={`${inputClass} ${validationErrors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => {
                        setFormData({...formData, password: e.target.value});
                        if (validationErrors.password) {
                          setValidationErrors(prev => ({ ...prev, password: undefined }));
                        }
                      }}
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                      {showPassword ? (
                        <Icons.EyeOff className="w-4 h-4" />
                      ) : (
                        <Icons.Eye className="w-4 h-4" />
                      )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="text-red-500 text-xs mt-1 ml-2">{validationErrors.password}</p>
                )}
                {isRegistering && (
                  <div className="mt-2 ml-2 text-[10px] text-gray-500">
                    <p className="font-semibold mb-1">Requisitos:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>Mínimo 8 caracteres</li>
                      <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>Una mayúscula</li>
                      <li className={/[!@#$%^&*(),.?":{}|<>]/.test(formData.password) ? 'text-green-600' : ''}>Un signo especial</li>
                    </ul>
                  </div>
                )}
                {!isRegistering && (
                  <button 
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="mt-2 ml-2 text-[10px] font-bold text-gray-400 uppercase hover:text-black transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
            )}

            {isRegistering && (
               <div className="animate-fade-in pt-2">
                  <label className="block text-xs font-bold text-gray-600 ml-2 mb-2 uppercase tracking-wider">Soy...</label>
                  <div className="grid grid-cols-2 gap-3">
                     <button
                        type="button"
                        onClick={() => setFormData({...formData, role: 'client'})}
                        className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                           formData.role === 'client' 
                           ? 'bg-black text-white shadow-md' 
                           : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                     >
                        Cliente
                     </button>
                     <button
                        type="button"
                        onClick={() => setFormData({...formData, role: 'owner'})}
                        className={`py-2 px-4 rounded-full text-sm font-medium transition-all ${
                           formData.role === 'owner' 
                           ? 'bg-black text-white shadow-md' 
                           : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                     >
                        Propietario
                     </button>
                  </div>
               </div>
            )}

            {successMessage && (
              <div className="text-green-600 text-sm text-center bg-green-50 py-3 px-4 rounded-xl font-bold border border-green-100 animate-bounce">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg font-medium">
                {error}
              </div>
            )}

            <div className="pt-2">
              <Button 
                type="submit" 
                onClick={() => {}} 
                variant="brand" 
                className="w-full py-3 text-base"
                disabled={isCheckingAvailability || isLoading}
              >
                 {isCheckingAvailability 
                   ? 'Verificando...' 
                   : isForgotPassword 
                     ? 'Enviar Correo' 
                     : isRegistering 
                       ? 'Registrarse' 
                       : 'Iniciar Sesión'}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {isForgotPassword ? '¿Recordaste tu contraseña?' : isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta?'}
              <button 
                type="button"
                onClick={() => {
                  if (isForgotPassword) {
                    setIsForgotPassword(false);
                  } else {
                    setIsRegistering(!isRegistering);
                  }
                }}
                className="ml-2 font-bold text-black hover:underline focus:outline-none"
              >
                {isForgotPassword ? 'Inicia sesión' : isRegistering ? 'Inicia sesión' : 'Regístrate'}
              </button>
            </p>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">O continúa con</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={async () => {
                try {
                  setError('');
                  if (isRegistering) {
                    localStorage.setItem('casaseg_pending_role', formData.role);
                  } else {
                    localStorage.removeItem('casaseg_pending_role');
                  }
                  await signInWithGoogle();
                } catch (err) {
                  console.error(err);
                  setError('Error al iniciar con Google. Inténtalo de nuevo.');
                  localStorage.removeItem('casaseg_pending_role');
                }
              }}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors bg-white font-medium text-gray-700 text-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors bg-white font-medium text-gray-700 text-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.56-2.09-.48-3.08.35-1.04.86-2.17.73-3.08-.28-4.56-5.01-3.69-12.22 1.64-12.16 1.4.02 2.37.91 3.12.91.75 0 1.96-1.06 3.48-.91 1.55.15 2.68.83 3.4.91-.73.49-3.23 2.15-2.8 5.76.44 3.73 3.52 4.98 3.52 4.98-.03.11-.53 1.76-1.78 3.57-1.11 1.62-2.27 3.22-3.82 3.22zM12.03 5.33c-.22-2.17 1.69-4.08 3.59-4.14.3.01.62.06.91.17.22 2.62-2.77 4.23-4.5 3.97z" />
              </svg>
              Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
