import React from 'react';
import { Radio, Shield, Zap } from 'lucide-react';
import { LuCode } from 'react-icons/lu';
import VideoEmbed from './VideoEmbed';

const OverviewSection: React.FC = () => {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Radio className="w-6 h-6 text-cyan-400" />
        <h2 className="text-2xl md:text-3xl font-mono font-bold text-white uppercase tracking-wide">
          Overview
        </h2>
      </div>

      <VideoEmbed 
        title="Welcome to Orbital Lending"
        description="Complete introduction to the protocol and its orbital mechanics"
        youtubeUrl="https://www.youtube.com/embed/LeP5kJzzq5M?si=oBoE4u6dmcCA7n1M"
      />

      <div className="prose prose-invert max-w-none">
        <div className="text-slate-300 font-mono leading-relaxed space-y-4">
          <p>
            <strong className="text-cyan-400">Orbital Lending</strong> is a decentralized lending protocol built on Algorand, 
            designed with a clean, intuitive interface that creates an engaging experience for both DeFi newcomers and veterans.
          </p>
          
          <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4 my-6">
            <h4 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Core Features
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                <strong>Supply Assets:</strong> Supply your tokens to earn interest
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                <strong>Receive Collateral:</strong> Get collateralised 'c' tokens representing your deposit
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                <strong>Borrow Funds:</strong> Launch positions against your collateral tokens
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                <strong>Trade Debt:</strong> Buy and sell tokenized debt positions
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                <strong>Monitor Health:</strong> Track position safety in real-time
              </li>
            </ul>
          </div>

          <p>
            The protocol uses a{" "}
            <strong className="text-cyan-400">
              clean, intuitive interface
            </strong>{" "}
            designed to create an engaging experience for
            both DeFi newcomers and veterans.
          </p>

          <div className="bg-slate-800 bg-opacity-50 border border-slate-600 rounded-lg p-4 my-6">
            <h4 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
              <LuCode className="w-4 h-4" />
              Open Source & Powered by CompX
            </h4>
            <div className="space-y-3 text-sm">
              <p>
                <strong className="text-cyan-400">
                  Orbital Lending
                </strong>{" "}
                is completely open source, ensuring transparency
                and community-driven development. All smart
                contracts, frontend code, and documentation are
                publicly available for review and contribution.
              </p>
              <p>
                Built and maintained by{" "}
                <strong className="text-compx-pink">
                  CompX Labs
                </strong>
                , a team dedicated to creating innovative DeFi
                solutions on Algorand.
              </p>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-700">
                <a
                  href="https://github.com/compx-labs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors font-mono text-xs"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.49.5.09.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10Z" />
                  </svg>
                  VIEW SOURCE CODE
                </a>
                <a
                  href="https://compx.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-compx-pink hover:text-pink-400 transition-colors font-mono text-xs"
                >
                  <Zap className="w-4 h-4" />
                  LEARN ABOUT COMPX
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;
