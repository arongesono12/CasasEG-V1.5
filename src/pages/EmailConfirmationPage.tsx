import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';
import { trackUserSession } from '../services/cookieService';
import logo from '../assets/logo/logo.png';
import { Icons } from '../components/Icons';

export const EmailConfirmationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verificando tu email...');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Supabase sends tokens in URL hash fragments or query params
        // Check both hash and query params
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const token = searchParams.get('token') || hashParams.get('token') || hashParams.get('access_token');
        const type = searchParams.get('type') || hashParams.get('type');
        
        // Also check for Supabase's standard confirmation flow
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        // If we have access_token and refresh_token, Supabase already confirmed
        if (accessToken && refreshToken) {
          // Set the session
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            throw sessionError;
          }

          if (sessionData?.user) {
            trackUserSession(sessionData.user.id);
            setStatus('success');
            setMessage('¡Email confirmado exitosamente! Ya formas parte de CasasEG.');
            setTimeout(() => {
              navigate('/');
            }, 3000);
            return;
          }
        }

        // Fallback: Try OTP verification if token is provided
        if (token) {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: type === 'recovery' ? 'recovery' : 'email',
          });

          if (error) {
            throw error;
          }

          if (data?.user) {
            trackUserSession(data.user.id);
            setStatus('success');
            setMessage('¡Email confirmado exitosamente! Ya formas parte de CasasEG.');
            setTimeout(() => {
              navigate('/');
            }, 3000);
            return;
          }
        }

        // If no tokens found, check if user is already confirmed
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.email_confirmed_at) {
          trackUserSession(session.user.id);
          setStatus('success');
          setMessage('¡Tu email ya está confirmado! Ya formas parte de CasasEG.');
          setTimeout(() => {
            navigate('/');
          }, 3000);
          return;
        }

        // No valid confirmation found
        setStatus('error');
        setMessage('No se encontró un token de verificación válido. Por favor, verifica el enlace del email.');
      } catch (err: any) {
        console.error('Error verifying email:', err);
        setStatus('error');
        setMessage(err.message || 'Error al verificar el email. El enlace puede haber expirado.');
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center">
        <div className="flex flex-col items-center mb-6">
          <div className="mb-4">
            <img src={logo} alt="CasasEG" className="h-20 w-auto object-contain mx-auto" />
          </div>
          
          {status === 'loading' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-black mb-4"></div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Verificando...</h1>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="bg-green-100 rounded-full p-4 mb-4">
                <Icons.Check className="w-12 h-12 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">¡Bienvenido a CasasEG!</h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Serás redirigido en unos segundos...</p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
              >
                Ir al inicio
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="bg-red-100 rounded-full p-4 mb-4">
                <Icons.Close className="w-12 h-12 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-2">Error de verificación</h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full font-medium hover:bg-gray-300 transition-colors"
                >
                  Ir al inicio
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

