import Router from "./Router";
import { Toast } from "./components/app/Toast";
import { Providers } from "./components/app/provider";
import { WalletConnectionModal } from "./components/app/walletConnectModal";
import { ToastProvider } from "./context/toastContext";
import { WalletContextProvider } from "./context/wallet";

function App() {
  return (
    <Providers>
      <WalletContextProvider>
        <WalletConnectionModal />
        <ToastProvider>
          <Toast />
          <Router />
        </ToastProvider>
      </WalletContextProvider>
    </Providers>
  );
}

export default App;
