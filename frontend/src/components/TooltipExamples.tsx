import React from 'react';
import { Info, HelpCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import Tooltip from './Tooltip';

/**
 * TooltipExamples - Demonstrates various uses of the Tooltip component
 * 
 * This component shows different tooltip configurations and use cases
 * for the Orbital Lending design system.
 */
const TooltipExamples: React.FC = () => {
  return (
    <div className="space-y-8 p-6 bg-slate-800 rounded-lg">
      <h2 className="text-2xl font-mono font-bold text-white mb-6">Tooltip Examples</h2>
      
      {/* Basic Usage */}
      <section className="space-y-4">
        <h3 className="text-lg font-mono font-semibold text-cyan-400">Basic Usage</h3>
        <div className="flex flex-wrap gap-4">
          <Tooltip content="This is a basic tooltip">
            <button className="px-4 py-2 bg-slate-700 text-white font-mono rounded hover:bg-slate-600 transition-colors">
              Hover me
            </button>
          </Tooltip>
          
          <Tooltip content="Tooltip with custom text color" textColor="text-cyan-300">
            <button className="px-4 py-2 bg-cyan-600 text-white font-mono rounded hover:bg-cyan-500 transition-colors">
              Custom Color
            </button>
          </Tooltip>
        </div>
      </section>

      {/* Positioning */}
      <section className="space-y-4">
        <h3 className="text-lg font-mono font-semibold text-cyan-400">Positioning</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 place-items-center py-8">
          <Tooltip content="Tooltip on top" position="top">
            <button className="px-3 py-2 bg-slate-700 text-white font-mono text-sm rounded">
              Top
            </button>
          </Tooltip>
          
          <Tooltip content="Tooltip on right" position="right">
            <button className="px-3 py-2 bg-slate-700 text-white font-mono text-sm rounded">
              Right
            </button>
          </Tooltip>
          
          <Tooltip content="Tooltip on bottom" position="bottom">
            <button className="px-3 py-2 bg-slate-700 text-white font-mono text-sm rounded">
              Bottom
            </button>
          </Tooltip>
          
          <Tooltip content="Tooltip on left" position="left">
            <button className="px-3 py-2 bg-slate-700 text-white font-mono text-sm rounded">
              Left
            </button>
          </Tooltip>
        </div>
      </section>

      {/* With Icons */}
      <section className="space-y-4">
        <h3 className="text-lg font-mono font-semibold text-cyan-400">With Icons</h3>
        <div className="flex flex-wrap gap-6">
          <Tooltip content="Information about this feature" textColor="text-blue-300">
            <div className="flex items-center gap-2 text-blue-400 cursor-help">
              <Info className="w-4 h-4" />
              <span className="font-mono text-sm">Info</span>
            </div>
          </Tooltip>
          
          <Tooltip content="Need help? Click for documentation" textColor="text-green-300">
            <div className="flex items-center gap-2 text-green-400 cursor-help">
              <HelpCircle className="w-4 h-4" />
              <span className="font-mono text-sm">Help</span>
            </div>
          </Tooltip>
          
          <Tooltip content="Warning: This action cannot be undone" textColor="text-amber-300">
            <div className="flex items-center gap-2 text-amber-400 cursor-help">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-mono text-sm">Warning</span>
            </div>
          </Tooltip>
          
          <Tooltip content="Operation completed successfully" textColor="text-green-300">
            <div className="flex items-center gap-2 text-green-400 cursor-help">
              <CheckCircle className="w-4 h-4" />
              <span className="font-mono text-sm">Success</span>
            </div>
          </Tooltip>
        </div>
      </section>

      {/* Orbital Theme Examples */}
      <section className="space-y-4">
        <h3 className="text-lg font-mono font-semibold text-cyan-400">Orbital Theme Examples</h3>
        <div className="space-y-4">
          <div className="bg-slate-700 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-mono text-slate-300">Supply APR</span>
              <Tooltip 
                content="Annual Percentage Rate for lending your assets"
                textColor="text-cyan-300"
                position="left"
              >
                <span className="font-mono font-bold text-cyan-400 cursor-help">
                  +5.24%
                </span>
              </Tooltip>
            </div>
          </div>
          
          <div className="bg-slate-700 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <Tooltip 
                content="Loan-to-Value ratio: percentage of collateral value you can borrow"
                textColor="text-slate-300"
                position="right"
              >
                <span className="font-mono text-slate-400 cursor-help">LTV Ratio</span>
              </Tooltip>
              <span className="font-mono font-bold text-blue-400">
                65.0% / 80%
              </span>
            </div>
          </div>
          
          <div className="bg-slate-700 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-mono text-slate-400">Available Balance</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-white">1,234.56 ALGO</span>
                <Tooltip 
                  content="Use your entire wallet balance"
                  textColor="text-cyan-300"
                  position="top"
                >
                  <button className="text-xs font-mono font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
                    MAX
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom Delay */}
      <section className="space-y-4">
        <h3 className="text-lg font-mono font-semibold text-cyan-400">Custom Delay</h3>
        <div className="flex gap-4">
          <Tooltip content="Fast tooltip (100ms delay)" delay={100}>
            <button className="px-4 py-2 bg-slate-700 text-white font-mono rounded hover:bg-slate-600 transition-colors">
              Fast (100ms)
            </button>
          </Tooltip>
          
          <Tooltip content="Normal tooltip (300ms delay)" delay={300}>
            <button className="px-4 py-2 bg-slate-700 text-white font-mono rounded hover:bg-slate-600 transition-colors">
              Normal (300ms)
            </button>
          </Tooltip>
          
          <Tooltip content="Slow tooltip (800ms delay)" delay={800}>
            <button className="px-4 py-2 bg-slate-700 text-white font-mono rounded hover:bg-slate-600 transition-colors">
              Slow (800ms)
            </button>
          </Tooltip>
        </div>
      </section>

      {/* Usage Code Example */}
      <section className="space-y-4">
        <h3 className="text-lg font-mono font-semibold text-cyan-400">Usage Code</h3>
        <div className="bg-slate-900 p-4 rounded-lg overflow-x-auto">
          <pre className="text-sm font-mono text-slate-300">
{`import Tooltip from './components/Tooltip';

// Basic usage
<Tooltip content="Your tooltip text">
  <button>Hover me</button>
</Tooltip>

// With custom options
<Tooltip 
  content="Custom tooltip"
  textColor="text-cyan-300"
  position="top"
  delay={500}
>
  <span>Element with tooltip</span>
</Tooltip>

// Disabled state
<Tooltip 
  content="This won't show"
  disabled={true}
>
  <button disabled>Disabled button</button>
</Tooltip>`}
          </pre>
        </div>
      </section>
    </div>
  );
};

export default TooltipExamples;
