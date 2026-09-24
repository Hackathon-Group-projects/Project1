import re

code_block_str = """
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { FiCopy, FiCheck } from 'react-icons/fi';

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

export default function AIChatWidget() {
"""

renderer_str = """code({node, className, children, ...props}) {
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
                        }"""

filepath = 'client/src/components/AIChatWidget.jsx'
with open(filepath, 'r') as f:
    content = f.read()

# Make sure ReactMarkdown is imported
if 'import ReactMarkdown' not in content:
    content = content.replace(
        "import { TbRobot } from \"react-icons/tb\";",
        "import { TbRobot } from \"react-icons/tb\";\nimport ReactMarkdown from 'react-markdown';"
    )

# Inject CopyableCodeBlock before the function
if 'const CopyableCodeBlock' not in content:
    content = content.replace("export default function AIChatWidget() {", code_block_str)

# Update the {msg.text} render
if 'ReactMarkdown' not in content:
    old_msg = "{msg.text}"
    new_msg = """{msg.sender === 'ai' ? (
                  <div className="markdown-body-chat leading-relaxed">
                    <ReactMarkdown
                      components={{
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        """ + renderer_str + """
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  msg.text
                )}"""
    # Replace ONLY inside the message render block, not everywhere
    content = content.replace("""<div
                className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#09090b] text-white rounded-br-xs'
                    : 'bg-slate-100 text-zinc-800 border border-slate-200/60 rounded-bl-xs font-mono text-[11.5px] whitespace-pre-wrap'
                }`}
              >
                {msg.text}
              </div>""", """<div
                className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#09090b] text-white rounded-br-xs'
                    : 'bg-slate-100 text-zinc-800 border border-slate-200/60 rounded-bl-xs font-sans text-[11.5px] whitespace-pre-wrap'
                }`}
              >
                """ + new_msg + """
              </div>""")

with open(filepath, 'w') as f:
    f.write(content)

