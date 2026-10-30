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
      <div className="store-splash" role="status" aria-live="polite">
        <div className="store-splash__content">
          <div className="store-splash__mark">
            <img src="/brand-mark.svg" alt="" width="96" height="96" />
          </div>
          <h1 className="store-splash__title">Librería Lisjuashde</h1>
          <p className="store-splash__message">Preparando tu tienda</p>
          <div className="store-splash__dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    );
  }

  // La tienda es pública — el modal de login aparece solo cuando el cliente
  // intenta añadir al carrito, enviar impresiones o ver su cuenta.
  return (
    <div className="min-h-screen flex flex-col bg-[#fbf7f1] text-[#3f0a0b]">
      <Header />

      <main className="flex-1">
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
    </div>
  );
}
