import React from 'react';
import { Rocket } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-space-dark border-t border-neon-teal border-opacity-10 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-6 md:mb-0">
            <Rocket className="h-6 w-6 text-neon-teal" />
            <span className="font-display text-lg font-bold">Orbital<span className="text-neon-teal">Lending</span></span>
          </div>
          
          <div className="flex gap-8 mb-6 md:mb-0">
            <a href="#markets" className="text-soft-gray hover:text-neon-teal transition-colors">Markets</a>
            <a href="#tokenized-debt" className="text-soft-gray hover:text-neon-teal transition-colors">Loaner NFTs</a>
            <a href="#marketplace" className="text-soft-gray hover:text-neon-teal transition-colors">Marketplace</a>
            <a href="#why-orbital" className="text-soft-gray hover:text-neon-teal transition-colors">Benefits</a>
          </div>
          
          <div className="flex gap-4">
            <a href="#" className="text-soft-gray hover:text-neon-teal transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.317 4.36a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.111.806-.154 1.17-1.5-.224-2.994-.224-4.478 0a8.18 8.18 0 0 0-.155-1.17.076.076 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 8.074-.32 11.663.099 15.202a.082.082 0 0 0 .031.057c2.03 1.5 3.995 2.407 5.927 3.016a.076.076 0 0 0 .083-.026c.455-.623.885-1.278 1.244-1.966a.075.075 0 0 0-.041-.105 13.229 13.229 0 0 1-1.886-.9.075.075 0 0 1-.008-.126c.126-.094.252-.192.372-.29a.075.075 0 0 1 .078-.01c3.927 1.792 8.18 1.792 12.061 0a.075.075 0 0 1 .078.01c.12.099.246.196.373.29a.075.075 0 0 1-.007.127 12.239 12.239 0 0 1-1.887.899.075.075 0 0 0-.041.105c.363.689.79 1.343 1.243 1.967a.076.076 0 0 0 .083.026c1.937-.61 3.902-1.516 5.932-3.016a.076.076 0 0 0 .032-.057c.5-4.107-.839-7.66-3.549-10.815a.06.06 0 0 0-.031-.026Z" fill="currentColor"/>
              </svg>
            </a>
            <a href="#" className="text-soft-gray hover:text-neon-teal transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733a4.67 4.67 0 0 0 2.048-2.578 9.3 9.3 0 0 1-2.958 1.13 4.66 4.66 0 0 0-7.938 4.25 13.229 13.229 0 0 1-9.602-4.868 4.66 4.66 0 0 0 1.442 6.22 4.647 4.647 0 0 1-2.11-.583v.06a4.66 4.66 0 0 0 3.737 4.568 4.692 4.692 0 0 1-2.104.08 4.661 4.661 0 0 0 4.352 3.234 9.348 9.348 0 0 1-5.786 1.995c-.376 0-.747-.022-1.112-.065a13.175 13.175 0 0 0 7.14 2.093c8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602a9.47 9.47 0 0 0 2.323-2.41l.002-.003Z" fill="currentColor"/>
              </svg>
            </a>
            <a href="#" className="text-soft-gray hover:text-neon-teal transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm3.163 11.984h-2.067c0 3.313 0 7.394 0 7.394H9.893s.007-4.043 0-7.394H8.493V9.42h1.4V7.881c0-1.157.55-2.97 2.967-2.97l2.18.01v2.428s-1.327 0-1.587 0c-.26 0-.634.13-.634.686v1.386h2.255l-.264 2.564Z" fill="currentColor"/>
              </svg>
            </a>
            <a href="#" className="text-soft-gray hover:text-neon-teal transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.49.5.09.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10Z" fill="currentColor"/>
              </svg>
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-neon-teal border-opacity-10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-soft-gray text-sm">
            © {currentYear} Orbital Lending by CompX. All rights reserved.
          </p>
          
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="text-soft-gray hover:text-neon-teal transition-colors text-sm">Terms</a>
            <a href="#" className="text-soft-gray hover:text-neon-teal transition-colors text-sm">Privacy</a>
            <a href="#" className="text-soft-gray hover:text-neon-teal transition-colors text-sm">Docs</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;