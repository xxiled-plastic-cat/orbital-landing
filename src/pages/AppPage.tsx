import React from 'react';
import { TrendingUp, DollarSign, BarChart3, Droplets, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import AppLayout from '../components/app/AppLayout';

const AppPage = () => {
  return (
    <AppLayout>
      <div className="container-section py-12">
        {/* Welcome Section */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-sora font-bold mb-6">
            Welcome to <span className="text-neon-teal">Orbital Lending</span>
          </h2>
          <p className="text-xl text-soft-gray max-w-3xl mx-auto mb-8">
            Experience the future of decentralized lending on Algorand testnet. 
            Create loans, trade debt positions, and explore permissionless finance.
          </p>
          
          {/* Glassmorphism testnet warning */}
          <motion.div 
            className="relative max-w-2xl mx-auto group"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-neon-purple to-neon-pink opacity-20 rounded-xl blur-sm group-hover:opacity-30 transition-opacity duration-300"></div>
            <div className="relative backdrop-blur-md bg-white bg-opacity-10 border border-neon-purple border-opacity-30 rounded-xl p-6">
              <div className="flex items-center justify-center gap-3">
                <Zap className="w-5 h-5 text-neon-purple" />
                <p className="text-neon-teal font-medium">
                  🚧 This is a testnet environment. All transactions use test tokens with no real value.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: DollarSign,
              title: "Create Loan",
              description: "Deposit collateral and borrow against your assets with competitive rates.",
              color: "neon-teal",
              delay: 0.4
            },
            {
              icon: TrendingUp,
              title: "Browse Marketplace",
              description: "Discover and trade debt positions with automated pricing and liquidity.",
              color: "neon-purple",
              delay: 0.6
            },
            {
              icon: BarChart3,
              title: "Portfolio",
              description: "Monitor your positions, track performance, and manage your debt portfolio.",
              color: "neon-pink",
              delay: 0.8
            }
          ].map((item) => (
            <motion.div
              key={item.title}
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: item.delay }}
            >
              {/* Glassmorphism background with glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br from-${item.color} to-${item.color} opacity-10 rounded-xl blur-sm group-hover:opacity-20 transition-opacity duration-300`}></div>
              <div className="relative backdrop-blur-md bg-white bg-opacity-5 border border-white border-opacity-10 rounded-xl p-8 text-center hover:bg-opacity-10 transition-all duration-300">
                <div className={`bg-${item.color} bg-opacity-20 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className={`text-${item.color} w-8 h-8`} />
                </div>
                <h3 className="font-sora text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-soft-gray mb-6 leading-relaxed">
                  {item.description}
                </p>
                <button className="relative overflow-hidden group/btn w-full">
                  <div className={`absolute inset-0 bg-gradient-to-r from-${item.color} to-${item.color} opacity-20 group-hover/btn:opacity-30 transition-opacity duration-300`}></div>
                  <div className="relative backdrop-blur-sm bg-white bg-opacity-10 border border-white border-opacity-20 px-6 py-3 rounded-lg hover:bg-opacity-20 transition-all duration-300">
                    Coming Soon
                  </div>
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Development Status with Glassmorphism */}
        <motion.div 
          className="relative group"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-neon-teal via-neon-purple to-neon-pink opacity-10 rounded-xl blur-sm group-hover:opacity-15 transition-opacity duration-300"></div>
          
          {/* Glassmorphism container */}
          <div className="relative backdrop-blur-md bg-white bg-opacity-5 border border-white border-opacity-10 rounded-xl p-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-neon-teal" />
              <h3 className="text-2xl font-sora font-bold text-center">Development Roadmap</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Phase 1 */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <div className="absolute inset-0 bg-neon-teal opacity-5 rounded-lg blur-sm"></div>
                <div className="relative backdrop-blur-sm bg-white bg-opacity-5 border border-neon-teal border-opacity-20 rounded-lg p-6">
                  <h4 className="font-bold text-neon-teal mb-4 flex items-center gap-2">
                    <Droplets className="w-5 h-5" />
                    Phase 1: Foundation
                  </h4>
                  <ul className="space-y-3 text-soft-gray">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-neon-teal rounded-full animate-pulse"></div>
                      <span>Routing Infrastructure ✅</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-neon-teal rounded-full opacity-50"></div>
                      <span>Orbital Background ✅</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-soft-gray rounded-full"></div>
                      <span>Wallet Integration</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-soft-gray rounded-full"></div>
                      <span>Testnet Faucet</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Phase 2 */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
              >
                <div className="absolute inset-0 bg-neon-purple opacity-5 rounded-lg blur-sm"></div>
                <div className="relative backdrop-blur-sm bg-white bg-opacity-5 border border-neon-purple border-opacity-20 rounded-lg p-6">
                  <h4 className="font-bold text-neon-purple mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Phase 2: Core Features
                  </h4>
                  <ul className="space-y-3 text-soft-gray">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-soft-gray rounded-full"></div>
                      <span>Smart Contract Integration</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-soft-gray rounded-full"></div>
                      <span>Borrowing Interface</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-soft-gray rounded-full"></div>
                      <span>Marketplace Trading</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-soft-gray rounded-full"></div>
                      <span>Portfolio Management</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default AppPage;
