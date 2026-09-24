const fs = require('fs');

let code = fs.readFileSync('client/src/report/AiFixTab.jsx', 'utf8');

// 1. Add FiSend to imports
if (!code.includes('FiSend')) {
    code = code.replace('FiPercent', 'FiPercent, FiSend');
}

// 2. Add state and handler
const stateToAdd = `  const [selectedIssue, setSelectedIssue] = useState(null);
  const [chatInput, setChatInput] = useState('');

  const handleAskAI = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const event = new CustomEvent('open-secura-chat', {
      detail: { query: chatInput }
    });
    window.dispatchEvent(event);
    setChatInput('');
  };`;
code = code.replace('  const [selectedIssue, setSelectedIssue] = useState(null);', stateToAdd);

// 3. Add the Chat Card at the end of the issues grid
const chatCardJSX = `
      {/* Custom AI Query Card */}
      <div className="mt-8 bg-gradient-to-br from-zinc-900 to-black rounded-2xl p-6 sm:p-8 shadow-xl border border-zinc-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <HiSparkles className="text-8xl text-cyan-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800/80 border border-zinc-700/50 mb-3">
              <HiSparkles className="text-[12px] text-cyan-400" />
              <span className="text-[9px] font-mono font-bold text-zinc-300 uppercase tracking-wider">Ask Custom Query</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Have a specific question about these patches?</h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
              Type your question below and Secura AI will answer it using your scan data as context. 
            </p>
          </div>
          
          <div className="flex-1 w-full">
            <form onSubmit={handleAskAI} className="relative flex items-center w-full">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="E.g., How do I apply this fix in Docker?"
                className="w-full pl-4 pr-12 py-3.5 bg-zinc-800/50 border border-zinc-700/80 rounded-xl text-sm font-mono text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500 focus:bg-zinc-800 transition-all shadow-inner"
              />
              <button
                type="submit"
                className="absolute right-2 w-9 h-9 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-900 flex items-center justify-center transition-all cursor-pointer shadow-md"
              >
                <FiSend className="text-sm" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {selectedIssue`;

code = code.replace('{selectedIssue', chatCardJSX);

fs.writeFileSync('client/src/report/AiFixTab.jsx', code);
console.log("Chat card added!");
