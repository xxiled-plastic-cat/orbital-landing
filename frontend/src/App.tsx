import Router from "./Router";
import { Toast } from "./components/app/Toast";
import { Providers } from "./components/app/provider";
import { WalletConnectionModal } from "./components/app/walletConnectModal";
import { ToastProvider } from "./context/toastContext";
import { WalletContextProvider } from "./context/wallet";
import { ExplorerProvider } from "./context/explorerContext";

function App() {
  return (
    <Providers>
      <ExplorerProvider>
        <WalletContextProvider>
          <WalletConnectionModal />
          <ToastProvider>
            <Toast />
            <Router />
          </ToastProvider>
        </WalletContextProvider>
      </ExplorerProvider>
    </Providers>
  );
}

export default App;
