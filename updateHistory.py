import sys

with open('client/src/pages/HistoryPage.jsx', 'r') as f:
    content = f.read()

# 1. Add state variable
content = content.replace(
    "const [searchTerm, setSearchTerm] = useState('');",
    "const [searchTerm, setSearchTerm] = useState('');\n  const [deleteModalScanId, setDeleteModalScanId] = useState(null);"
)

# 2. Replace handleDelete
new_handle_delete = """
  const confirmDelete = async () => {
    const id = deleteModalScanId;
    if (!id) return;
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      await fetch(`http://${window.location.hostname}:4000/api/scan/${id}`, { method: 'DELETE', headers });
      setScans(scans.filter(s => s._id !== id));
      setDeleteModalScanId(null);
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };
"""
# Need to find the exact handleDelete block
import re
content = re.sub(
    r"const handleDelete = async \(id\) => \{[\s\S]*?catch \(error\) \{\n\s*console.error\('Failed to delete', error\);\n\s*\}\n\s*\};",
    new_handle_delete,
    content
)

# 3. Replace onClick={() => handleDelete(scan._id)}
content = content.replace(
    "onClick={() => handleDelete(scan._id)}",
    "onClick={() => setDeleteModalScanId(scan._id)}"
)

# 4. Inject Modal at the end, right before the last </div></div>
modal_jsx = """
        {/* Custom Delete Modal */}
        {deleteModalScanId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-[400px] max-w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Scan Report</h3>
              <p className="text-slate-500 text-sm mb-6">Are you sure you want to remove this report from your history? This action cannot be undone.</p>
              <div className="flex items-center justify-end gap-3">
                <button 
                  onClick={() => setDeleteModalScanId(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm shadow-red-200 transition-all"
                >
                  Delete Report
                </button>
              </div>
            </div>
          </div>
        )}
"""

content = content.replace(
    "      </div>\n    </div>\n  );\n}",
    modal_jsx + "      </div>\n    </div>\n  );\n}"
)

with open('client/src/pages/HistoryPage.jsx', 'w') as f:
    f.write(content)

print("HistoryPage updated!")
