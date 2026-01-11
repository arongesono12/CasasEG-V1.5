import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { Icons } from '../Icons';
import { Button } from '../ui';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
  users: User[];
  onRegister: (newUser: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose, 
  onLogin, 
  users, 
  onRegister 
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'client' as UserRole
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', email: '', password: '', role: 'client' });
      setError('');
      setIsRegistering(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegistering) {
      // REGISTRATION
      if (!formData.name || !formData.email || !formData.password) {
        setError('Todos los campos son obligatorios');
        return;
      }
      if (users.some(u => u.email === formData.email)) {
        setError('El email ya está registrado');
        return;
      }

      const newUser: User = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`,
        password: formData.password
      };
      
      onRegister(newUser);
    } else {
      // LOGIN
      if (!formData.email || !formData.password) {
        setError('Por favor ingresa email y contraseña');
        return;
      }

      const user = users.find(u => u.email === formData.email && u.password === formData.password);
      if (user) {
        onLogin(user);
      } else {
        setError('Credenciales inválidas');
      }
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-full px-4 py-2.5 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all bg-white text-gray-800 placeholder-gray-400";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10">
          <Icons.Close className="w-5 h-5 text-gray-500" />
        </button>
        
        <div className="flex flex-col items-center mb-6">
          <div className="bg-black p-3 rounded-full mb-4 shadow-lg">
            <Icons.Home className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800">
            {isRegistering ? 'Crear Cuenta' : 'Bienvenido de nuevo'}
          </h1>
          <p className="text-center text-gray-500 text-sm mt-1">
            {isRegistering ? 'Únete a la comunidad de CasasEG' : 'Accede a tu cuenta para continuar'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="animate-fade-in">
               <label className="block text-xs font-bold text-gray-600 ml-2 mb-1 uppercase tracking-wider">Nombre Completo</label>
               <input 
                  type="text"
                  className={inputClass}
                  placeholder="Ej. Juan Pérez"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
               />
            </div>
          )}

          <div>
             <label className="block text-xs font-bold text-gray-600 ml-2 mb-1 uppercase tracking-wider">Email</label>
             <input 
                type="email"
                className={inputClass}
                placeholder="usuario@ejemplo.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
             />
          </div>

          <div>
             <label className="block text-xs font-bold text-gray-600 ml-2 mb-1 uppercase tracking-wider">Contraseña</label>
             <input 
                type="password"
                className={inputClass}
                placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
             />
          </div>

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

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg font-medium">
              {error}
            </div>
          )}

          <div className="pt-2">
            <Button type="submit" onClick={() => {}} variant="brand" className="w-full py-3 text-base">
               {isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta?'}
            <button 
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="ml-2 font-bold text-black hover:underline focus:outline-none"
            >
              {isRegistering ? 'Inicia sesión' : 'Regístrate'}
            </button>
          </p>
        </div>

        {/* Development Quick Access */}
        {!isRegistering && (
          <div className="mt-8 border-t border-gray-100 pt-4 text-center">
            <p className="text-xs text-gray-400 mb-2">Acceso Rápido (Demo)</p>
            <div className="flex justify-center gap-2">
               <button onClick={() => { setFormData({...formData, email: 'admin@vesta.com', password: '123'}) }} className="text-[10px] bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">Admin</button>
               <button onClick={() => { setFormData({...formData, email: 'owner@test.com', password: '123'}) }} className="text-[10px] bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">Owner</button>
               <button onClick={() => { setFormData({...formData, email: 'client@test.com', password: '123'}) }} className="text-[10px] bg-gray-100 px-2 py-1 rounded hover:bg-gray-200">Client</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

