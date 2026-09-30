import re

with open('client/src/pages/Report.jsx', 'r') as f:
    lines = f.readlines()

# find the calculation block (lines 321 to 374 approx)
start_calc = -1
end_calc = -1
for i, line in enumerate(lines):
    if "// Compute score" in line:
        start_calc = i
    if "const riskLevel = score > 80 ? 'LOW' : score > 50 ? 'MEDIUM' : 'HIGH';" in line:
        end_calc = i

if start_calc != -1 and end_calc != -1:
    calc_block = lines[start_calc:end_calc+1]
    
    # remove it from original position
    del lines[start_calc:end_calc+1]
    
    # insert before handleExportPdf
    handle_idx = -1
    for i, line in enumerate(lines):
        if "const handleExportPdf = () => {" in line:
            handle_idx = i
            break
            
    if handle_idx != -1:
        lines = lines[:handle_idx] + calc_block + ["\n"] + lines[handle_idx:]
        
with open('client/src/pages/Report.jsx', 'w') as f:
    f.writelines(lines)
