import { motion } from "framer-motion";
import { ExternalLink, Shield, Zap } from "lucide-react";

const AppFooter = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "Discord",
      href: "https://discord.gg/pSG93C6UN8",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20.317 4.36a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.111.806-.154 1.17-1.5-.224-2.994-.224-4.478 0a8.18 8.18 0 0 0-.155-1.17.076.076 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 8.074-.32 11.663.099 15.202a.082.082 0 0 0 .031.057c2.03 1.5 3.995 2.407 5.927 3.016a.076.076 0 0 0 .083-.026c.455-.623.885-1.278 1.244-1.966a.075.075 0 0 0-.041-.105 13.229 13.229 0 0 1-1.886-.9.075.075 0 0 1-.008-.126c.126-.094.252-.192.372-.29a.075.075 0 0 1 .078-.01c3.927 1.792 8.18 1.792 12.061 0a.075.075 0 0 1 .078.01c.12.099.246.196.373.29a.075.075 0 0 1-.007.127 12.239 12.239 0 0 1-1.887.899.075.075 0 0 0-.041.105c.363.689.79 1.343 1.243 1.967a.076.076 0 0 0 .083.026c1.937-.61 3.902-1.516 5.932-3.016a.076.076 0 0 0 .032-.057c.5-4.107-.839-7.66-3.549-10.815a.06.06 0 0 0-.031-.026Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      name: "X",
      href: "https://x.com/compxlabs",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      name: "GitHub",
      href: "https://github.com/compx-labs",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.49.5.09.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
    {
      name: "Telegram",
      href: "https://t.me/compxlabs",
      icon: (
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"
            fill="currentColor"
          />
        </svg>
      ),
    },
  ];

  return (
    <motion.footer
      className="relative z-10 mt-12 md:mt-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="text-slate-600 cut-corners-lg mx-4 md:mx-6 lg:mx-8 p-6 md:p-8 bg-noise-dark border-2 border-slate-600 shadow-industrial">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8">
          {/* Branding Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 planet-ring">
                <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center border-2 border-slate-500">
                  <img
                    src="/orbital-logo.png"
                    alt="Orbital Lending"
                    className="w-10 h-10 rounded-full object-contain"
                  />
                </div>
              </div>
              <span className="text-xl font-mono font-bold text-white">
                ORBITAL<span className="text-cyan-400">LENDING</span>
              </span>
            </div>
            <p className="text-sm font-mono text-slate-400 leading-relaxed max-w-xs">
              Decentralized lending protocol on Algorand. Supply assets, borrow
              funds, and trade debt positions.
            </p>
            <div className="flex items-center gap-2 text-amber-400">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-wide">
                TESTNET ENVIRONMENT
              </span>
            </div>
            <div className="flex items-center gap-2 text-compx-pink">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-wide text-compx-pink">
                Powered by CompX
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-mono font-semibold text-white uppercase tracking-wide mb-2">
              Navigation
            </h3>
            <div className="flex flex-col gap-3">
              <a
                href="/app/markets"
                className="text-slate-400 hover:text-cyan-400 transition-colors font-mono text-sm flex items-center gap-2"
              >
                Markets
              </a>
              <a
                href="/app"
                className="text-slate-400 hover:text-cyan-400 transition-colors font-mono text-sm flex items-center gap-2"
              >
                Dashboard
              </a>
              <a
                href="https://compx.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-cyan-400 transition-colors font-mono text-sm flex items-center gap-2"
              >
                CompX Website
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://compx-documentation.gitbook.io/compx-documentation"
                className="text-slate-400 hover:text-cyan-400 transition-colors font-mono text-sm flex items-center gap-2"
              >
                Documentation
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Social & Community */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-mono font-semibold text-white uppercase tracking-wide mb-2">
              Community
            </h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="flex items-center justify-center w-10 h-10 cut-corners-sm bg-slate-700 border border-slate-600 text-slate-400 hover:text-cyan-400 hover:border-cyan-500 transition-all duration-150 shadow-inset"
                  title={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
            <div className="mt-4">
              <a
                href="https://compx.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-cyan-400  hover:text-cyan-300 transition-colors font-mono text-sm font-semibold cut-corners-sm px-3 py-1 border border-cyan-500 hover:border-cyan-400 shadow-inset"
              >
                <span className="text-sm">Visit CompX</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 md:pt-8 border-t border-slate-700 gap-4">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <p className="text-slate-500 font-mono text-xs">
              © {currentYear} Orbital Lending by CompX Labs. All rights
              reserved.
            </p>
            <div className="hidden md:block w-px h-4 bg-slate-600"></div>
            <p className="text-slate-500 font-mono text-xs">
              Built on Algorand
            </p>
          </div>

          {/* <div className="flex items-center gap-4 md:gap-6">
            <a 
              href="#" 
              className="text-slate-500 hover:text-slate-400 transition-colors font-mono text-xs"
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              className="text-slate-500 hover:text-slate-400 transition-colors font-mono text-xs"
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="text-slate-500 hover:text-slate-400 transition-colors font-mono text-xs"
            >
              Risk Disclaimer
            </a>
          </div> */}
        </div>
      </div>
    </motion.footer>
  );
};

export default AppFooter;
