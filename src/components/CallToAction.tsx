import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Rocket, CheckCircle, XCircle } from 'lucide-react';
import OrbitalParticles from './OrbitalParticles';
import { supabase } from '../lib/supabase';

export default function CallToAction() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const handleWaitlistSubmit = async () => {
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{ address: walletAddress }]);

      if (error) throw error;
      
      setSubmitStatus('success');
      setWalletAddress('');
    } catch (error) {
      console.error('Error submitting to waitlist:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
      },
    },
  };

  return (
    <section id="launch-app" className="relative py-24 bg-space-dark">
      <OrbitalParticles count={25} />
      
      {/* Background planet/orbital station effect */}
      <div className="absolute bottom-0 right-0 w-full h-full pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute bottom-0 right-5 md:right-20 w-64 h-64 md:w-96 md:h-96 rounded-full bg-deep-blue opacity-10 blur-3xl"
          animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <div className="container-section relative z-10">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={variants}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="section-title">Ready to Orbit?</h2>
          <p className="section-subtitle mx-auto">
            Join the waitlist to be among the first to experience the future of decentralized lending.
          </p>
          
          <motion.div 
            className="flex flex-col items-center gap-6 mt-12"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="flex flex-col gap-4 w-full max-w-md">
              <input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="Enter your wallet address or NFD"
                className="px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-neon-teal"
              />
              <button 
                onClick={handleWaitlistSubmit}
                disabled={isSubmitting || !walletAddress}
                className="orbital-btn-primary text-center sm:text-left flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Rocket size={20} />
                {isSubmitting ? 'Submitting...' : 'Join the waitlist'}
              </button>
              
              {submitStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-center gap-2 justify-center text-sm ${
                    submitStatus === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {submitStatus === 'success' ? (
                    <>
                      <CheckCircle size={16} />
                      <span>Successfully joined the waitlist!</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={16} />
                      <span>Error joining waitlist. Please try again.</span>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
          
          <motion.div 
            className="mt-16 p-6 border border-neon-teal border-opacity-20 rounded-xl bg-space-gray bg-opacity-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <h3 className="text-xl font-sora font-bold mb-4">Join the CompX Community</h3>
            <p className="text-soft-gray mb-6">
              Be part of the revolution reshaping the future of decentralized lending.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="https://discord.gg/pSG93C6UN8" 
                className="bg-deep-blue hover:bg-opacity-80 transition-colors px-6 py-3 rounded-md flex items-center gap-2"
              >
                <svg className="w-5 h-5 text-neon-teal" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.317 4.36a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.111.806-.154 1.17-1.5-.224-2.994-.224-4.478 0a8.18 8.18 0 0 0-.155-1.17.076.076 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.07.07 0 0 0-.032.027C.533 8.074-.32 11.663.099 15.202a.082.082 0 0 0 .031.057c2.03 1.5 3.995 2.407 5.927 3.016a.076.076 0 0 0 .083-.026c.455-.623.885-1.278 1.244-1.966a.075.075 0 0 0-.041-.105 13.229 13.229 0 0 1-1.886-.9.075.075 0 0 1-.008-.126c.126-.094.252-.192.372-.29a.075.075 0 0 1 .078-.01c3.927 1.792 8.18 1.792 12.061 0a.075.075 0 0 1 .078.01c.12.099.246.196.373.29a.075.075 0 0 1-.007.127 12.239 12.239 0 0 1-1.887.899.075.075 0 0 0-.041.105c.363.689.79 1.343 1.243 1.967a.076.076 0 0 0 .083.026c1.937-.61 3.902-1.516 5.932-3.016a.076.076 0 0 0 .032-.057c.5-4.107-.839-7.66-3.549-10.815a.06.06 0 0 0-.031-.026Z" fill="currentColor"/>
                </svg>
                Discord
              </a>
              <a 
                href="https://x.com/Compxlabs" 
                className="bg-deep-blue hover:bg-opacity-80 transition-colors px-6 py-3 rounded-md flex items-center gap-2"
              >
                <svg className="w-5 h-5 text-neon-teal" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>
                </svg>
                X
              </a>
              <a 
                href="https://www.youtube.com/@CompXLabs" 
                className="bg-deep-blue hover:bg-opacity-80 transition-colors px-6 py-3 rounded-md flex items-center gap-2"
              >
                <svg className="w-5 h-5 text-neon-teal" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="currentColor"/>
                </svg>
                Youtube
              </a>
              <a 
                href="https://github.com/compx-labs" 
                className="bg-deep-blue hover:bg-opacity-80 transition-colors px-6 py-3 rounded-md flex items-center gap-2"
              >
                <svg className="w-5 h-5 text-neon-teal" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.49.5.09.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10Z" fill="currentColor"/>
                </svg>
                GitHub
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}