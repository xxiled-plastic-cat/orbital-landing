import Router from "./Router";
import { Providers } from "./components/app/provider";
import { WalletConnectionModal } from "./components/app/walletConnectModal";
import { WalletContextProvider } from "./components/context/wallet";

function App() {
  return (
    <Providers>
      <WalletContextProvider>
        <WalletConnectionModal />
        <Router />
      </WalletContextProvider>
    </Providers>
  );
}

export default App;
