import { useApp } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Toast from './components/Toast';
import StoreView from './components/store/StoreView';
import PrintsView from './components/prints/PrintsView';
import AccessView from './components/account/AccessView';
import CartModal from './components/modals/CartModal';
import OrderDetailModal from './components/modals/OrderDetailModal';
import ConfirmModal from './components/modals/ConfirmModal';
import LoginModal from './components/modals/LoginModal';
import OrderConfirmationModal from './components/modals/OrderConfirmationModal';

export default function App() {
  const { currentView, authLoading } = useApp();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-3">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-indigo-600"></i>
          <p className="text-sm text-slate-500 font-medium">Cargando Librería Lisjuashde...</p>
        </div>
      </div>
    );
  }

  // La tienda es pública — el modal de login aparece solo cuando el cliente
  // intenta añadir al carrito, enviar impresiones o ver su cuenta.
  return (
    <>
      <Header />

      <main className="flex-1 overflow-y-auto">
        {currentView === 'store' && <StoreView />}
        {currentView === 'prints' && <PrintsView />}
        {currentView === 'access' && <AccessView />}
      </main>

      <Footer />

      {/* Modals */}
      <LoginModal />
      <CartModal />
      <OrderDetailModal />
      <OrderConfirmationModal />
      <ConfirmModal />
      <Toast />
    </>
  );
}
