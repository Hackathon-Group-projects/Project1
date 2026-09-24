import re

code_block_str = """
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CopyableCodeBlock = ({ className, children, ...props }) => {
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
};
"""

renderer_str = """code({node, inline, className, children, ...props}) {
            const match = /language-(\\w+)/.exec(className || '');
            const hasNewline = String(children).includes('\\n');
            const isBlock = match || hasNewline;
            return isBlock ? (
              <CopyableCodeBlock className={className} {...props}>{children}</CopyableCodeBlock>
            ) : (
              <code className="px-1.5 py-0.5 bg-slate-200/50 rounded-md font-mono text-[11px] border border-slate-200 text-zinc-800" {...props}>
                {children}
              </code>
            );
          }"""

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # 1. Replace CopyableCodeBlock completely
    import re
    # Find start of CopyableCodeBlock
    start = content.find("const CopyableCodeBlock")
    if start != -1:
        # Find where it ends. It usually ends with `};`
        end = content.find("};", start) + 2
        content = content[:start] + code_block_str + content[end:]
    
    # 2. Replace the code renderer
    # The renderer looks like: code({node, inline, className, children, ...props}) { ... }
    # We will find the start of it:
    start_code = content.find("code({node, inline, className, children, ...props}) {")
    if start_code != -1:
        # Find the matching closing brace. Simple heuristic: look for next `}}` or find matching brace
        # Usually it ends with:           );
        #                         }
        end_str = "          }"
        end_idx = content.find(end_str, start_code)
        if end_idx != -1:
            content = content[:start_code] + renderer_str + content[end_idx + len(end_str):]
    
    with open(filepath, 'w') as f:
        f.write(content)

patch_file('client/src/report/OverviewTab.jsx')
patch_file('client/src/report/AiFixTab.jsx')
