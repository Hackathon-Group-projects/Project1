import re

with open('client/src/components/AiFixModal.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I want to add a button at the end of the scrollable content.
# The end of the scrollable content looks like:
#                 </ReactMarkdown>
#             </div>
#           </div>
#         </div>
#       </div>
#     </div>
#   );
# }

new_button = """                </ReactMarkdown>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
             <button
               onClick={() => {
                 onClose();
                 window.dispatchEvent(new CustomEvent('open-secura-chat', {
                   detail: { query: `Can you help me understand and fix this vulnerability: ${issue.title || issue.type || 'Security Issue'}?` }
                 }));
               }}
               className="px-5 py-2.5 bg-[#09090b] text-white text-xs font-semibold rounded-xl shadow-md flex items-center gap-2 hover:bg-[#18181b] transition-all hover:scale-105 active:scale-95"
             >
               <span className="text-sm">✨</span>
               <span>Ask AI to Explain & Fix</span>
             </button>
          </div>
        </div>"""

content = content.replace("                </ReactMarkdown>\n            </div>\n          </div>\n        </div>", new_button + "\n      </div>")

with open('client/src/components/AiFixModal.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated AiFixModal.jsx")
