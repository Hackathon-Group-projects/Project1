const fs = require('fs');
const file = 'client/src/report/OverviewTab.jsx';
let code = fs.readFileSync(file, 'utf8');

// Find where "Prioritized List Header" starts and replace everything after it with the CTA
const splitIndex = code.indexOf('{/* Prioritized List Header */}');
if (splitIndex !== -1) {
  const topPart = code.substring(0, splitIndex);
  
  const ctaPart = `      {/* AI Remediation Call-To-Action */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-lg border border-zinc-700 group mt-8">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-700">
          <HiSparkles className="text-8xl text-zinc-100" />
        </div>
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-widest">Gemini Security Engine</span>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Automated Remediation Plan Ready</h2>
          <p className="text-sm text-zinc-400 max-w-xl leading-relaxed mb-6">
            The AI engine has analyzed the detected vulnerabilities and generated step-by-step 
            patching instructions, precise configuration snippets, and code fixes.
          </p>
          
          <button 
            onClick={() => onSwitchTab('ai')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-900 font-bold text-sm hover:bg-slate-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <HiSparkles className="text-cyan-500 text-lg" />
            <span>View AI Remediation Plan</span>
            <FiArrowRight className="text-zinc-400 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
`;
  
  fs.writeFileSync(file, topPart + ctaPart);
  console.log('Patched OverviewTab.jsx successfully!');
} else {
  console.log('Could not find Prioritized List Header tag.');
}
