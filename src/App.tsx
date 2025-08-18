import Router from "./Router";
import { Toast } from "./components/app/Toast";
import { Providers } from "./components/app/provider";
import { WalletConnectionModal } from "./components/app/walletConnectModal";
import { ToastProvider } from "./components/context/toastContext";
import { WalletContextProvider } from "./components/context/wallet";

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
