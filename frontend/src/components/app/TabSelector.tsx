import { motion } from "framer-motion";

interface Tab {
  id: string;
  label: string;
  disabled?: boolean;
}

interface TabSelectorProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

const TabSelector = ({ tabs, activeTab, onTabChange, className = "" }: TabSelectorProps) => {
  return (
    <div className={`relative ${className}`}>
      {/* Tab Background Track */}
      <div className="relative bg-slate-800/50 border border-slate-600  p-1 backdrop-blur-sm">
        {/* Active Tab Indicator */}
        <motion.div
          className="absolute top-1 bottom-1 bg-gradient-to-r from-slate-700 to-slate-600 border border-slate-500  shadow-lg"
          initial={false}
          animate={{
            left: `${(tabs.findIndex(tab => tab.id === activeTab) * 100) / tabs.length}%`,
            width: `${100 / tabs.length}%`,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
          }}
        />
        
        {/* Tab Buttons */}
        <div className="relative flex">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className={`
                flex-1 relative z-10 px-4 py-3 font-mono text-sm font-semibold uppercase tracking-wide
                transition-all duration-200 
                ${activeTab === tab.id
                  ? "text-white"
                  : tab.disabled
                  ? "text-slate-500 cursor-not-allowed"
                  : "text-slate-300 hover:text-white"
                }
              `}
            >
              <motion.span
                initial={false}
                animate={{
                  scale: activeTab === tab.id ? 1.02 : 1,
                  y: activeTab === tab.id ? -0.5 : 0,
                }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {tab.label}
              </motion.span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Subtle Glow Effect for Active Tab */}
      <motion.div
        className="absolute inset-0  opacity-20 pointer-events-none"
        initial={false}
        animate={{
          boxShadow: activeTab ? "0 0 20px rgba(6, 182, 212, 0.3)" : "none",
        }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
};

export default TabSelector;
