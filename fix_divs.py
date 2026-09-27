with open('client/src/components/AiFixModal.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

content = "".join(lines)
content = content.replace("      </div>\n      </div>\n    </div>", "      </div>\n    </div>")

with open('client/src/components/AiFixModal.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed divs")
