const fs = require('fs');

const highlighterImports = `import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';`;

const codeBlockDef = `const CopyableCodeBlock = ({ className, children, ...props }) => {
  const [copied, setCopied] = React.useState(false);
  const handleCopy = () => {
    const textToCopy = String(children).replace(/\\n$/, '');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const match = /language-(\\w+)/.exec(className || '');
  const language = match ? match[1] : 'text';

  return (
    <div className="relative my-3 rounded-xl overflow-hidden shadow-sm border border-zinc-800">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800">
        <span className="text-[9px] text-zinc-400 font-mono uppercase tracking-wider">{language}</span>
        <button onClick={handleCopy} className="flex items-center gap-1.5 text-[10px] text-zinc-400 hover:text-zinc-200 transition-colors bg-transparent border-none p-1">
          {copied ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <SyntaxHighlighter
        children={String(children).replace(/\\n$/, '')}
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        customStyle={{ margin: 0, padding: '1rem', background: '#0B0D13', fontSize: '11px', lineHeight: '1.6' }}
        {...props}
      />
    </div>
  );
};`;

const rendererFunction = `code({node, className, children, ...props}) {
                          const match = /language-(\\w+)/.exec(className || '');
                          const hasNewline = String(children).includes('\\n');
                          const isBlock = match || hasNewline;
                          return isBlock ? (
                            <CopyableCodeBlock className={className} {...props}>{children}</CopyableCodeBlock>
                          ) : (
                            <code className="px-1.5 py-0.5 bg-slate-200/50 rounded-md font-mono text-[10.5px] border border-slate-200 text-zinc-800 whitespace-nowrap" {...props}>
                              {children}
                            </code>
                          );
                        }`;

function patchFile(file, isAIChatWidget) {
  let code = fs.readFileSync(file, 'utf8');

  if (!code.includes('react-syntax-highlighter')) {
    code = code.replace(
      "import ReactMarkdown from 'react-markdown';",
      "import ReactMarkdown from 'react-markdown';\n" + highlighterImports
    );
  }

  // Replace CopyableCodeBlock
  const copyBlockRegex = /const CopyableCodeBlock = \(\{ className, children, \.\.\.props \}\) => \{[\s\S]*?return \([\s\S]*?\}\);\n\};/;
  code = code.replace(copyBlockRegex, codeBlockDef);

  // Replace the code renderer
  const rendererRegex = /code\(\{node, inline, className, children, \.\.\.props\}\) \{[\s\S]*?return !inline \? \([\s\S]*?\}\);[\s\S]*?\}/;
  code = code.replace(rendererRegex, rendererFunction);

  fs.writeFileSync(file, code);
  console.log('Patched ' + file);
}

patchFile('client/src/components/AIChatWidget.jsx', true);
patchFile('client/src/report/AiFixTab.jsx', false);
patchFile('client/src/report/OverviewTab.jsx', false);

