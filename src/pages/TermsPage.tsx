import React from 'react';
import { Header, MobileNavigation } from '../components/layout';
import { Icons } from '../components/Icons';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../components/layout/Footer';

export const TermsPage: React.FC = () => {
  const { currentUser: authUser, logout } = useAuth();
  const navigate = useNavigate();

  // Corregir el rol del usuario para el Header
  const currentUser = React.useMemo(() => {
    if (!authUser) return null;
    if (authUser.role === 'authenticated' && authUser.user_metadata?.role) {
      return { ...authUser, role: authUser.user_metadata.role };
    }
    return authUser;
  }, [authUser]);

  return (
    <div className="min-h-screen bg-white">
      <Header
        currentUser={currentUser}
        onLoginClick={() => navigate('/')}
        onLogout={logout}
        onMessagesClick={() => navigate('/')}
        onCreatePropertyClick={() => navigate('/')}
        onLogoClick={() => navigate('/')}
        messageCount={0}
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12 text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Términos y Condiciones</h1>
            <p className="text-gray-500">Última actualización: 29 de Enero, 2026</p>
        </div>

        <div className="prose prose-blue max-w-none text-gray-600 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icons.Check className="w-6 h-6 text-indigo-600" />
                1. Aceptación de los Términos
            </h2>
            <p>
              Al acceder y utilizar la plataforma de CasasEG, usted acepta cumplir y estar sujeto a los siguientes términos y condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icons.User className="w-6 h-6 text-indigo-600" />
                2. Descripción del Servicio
            </h2>
            <p>
              CasasEG es una plataforma de intermediación que conecta a propietarios de viviendas con posibles inquilinos. CasasEG no es propietaria de las viviendas publicadas ni actúa como agente inmobiliario, a menos que se especifique lo contrario. El contrato de alquiler se establece directamente entre el propietario y el inquilino.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icons.Admin className="w-6 h-6 text-indigo-600" />
                3. Responsabilidades del Usuario
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Usted debe proporcionar información veraz y precisa al registrarse y publicar propiedades.</li>
              <li>Es responsable de mantener la seguridad de su cuenta y contraseña.</li>
              <li>No debe utilizar la plataforma para fines ilegales o no autorizados.</li>
              <li>Los propietarios garantizan que tienen el derecho legal para alquilar la propiedad publicada.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icons.Building className="w-6 h-6 text-indigo-600" />
                4. Publicaciones y Contenido
            </h2>
            <p>
              CasasEG se reserva el derecho de eliminar cualquier publicación que considere inapropiada, fraudulenta o que viole estos términos. Las imágenes deben ser representaciones reales de la propiedad.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icons.Alert className="w-6 h-6 text-indigo-600" />
                5. Limitación de Responsabilidad
            </h2>
            <p>
              CasasEG no se hace responsable de las disputas que puedan surgir entre propietarios e inquilinos, ni de los daños, pérdidas o incumplimientos de contrato. Recomendamos encarecidamente realizar una inspección de la propiedad y firmar un contrato legal por escrito antes de cualquier transacción.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Icons.Plus className="w-6 h-6 text-indigo-600" />
                6. Modificaciones
            </h2>
            <p>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en la plataforma.
            </p>
          </section>
        </div>
        
        <div className="mt-16 p-8 bg-gray-50 rounded-2xl border border-gray-100 italic text-sm text-gray-500">
            Si tiene alguna pregunta sobre estos Términos, por favor contáctenos a través de nuestro centro de soporte o al correo legal@casaseg.com.
        </div>
      </main>

      <Footer />
      
      <MobileNavigation
        currentUser={currentUser}
        onHomeClick={() => navigate('/')}
        onPropertiesClick={() => navigate('/')}
        onMessagesClick={() => navigate('/')}
        onProfileClick={() => navigate('/profile')}
        onCreatePropertyClick={() => navigate('/')}
        messageCount={0}
      />
    </div>
  );
};
