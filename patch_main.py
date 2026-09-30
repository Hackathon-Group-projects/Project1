import re

with open("ai-service/main.py", "r") as f:
    content = f.read()

# 1. Update imports
imports_addition = """
from fastapi import FastAPI, HTTPException, Request, Depends
from sqlalchemy.orm import Session
from database import get_db, init_db
from models.models import AuditLog
"""
content = re.sub(
    r"from fastapi import FastAPI, HTTPException, Request",
    imports_addition.strip(),
    content
)

# 2. Update lifespan
lifespan_addition = """
    logger.info("🚀  Starting AI Service...")
    init_db()  # <-- Added database initialization
    rag_service    = RAGService()
"""
content = re.sub(
    r'    logger\.info\("🚀  Starting AI Service\.\.\."\)\n    rag_service    = RAGService\(\)',
    lifespan_addition.strip('\n'),
    content
)

# 3. Update analyze signature and body
analyze_old = r'async def analyze\(scan: ScanInput\):'
analyze_new = 'async def analyze(scan: ScanInput, db: Session = Depends(get_db)):'
content = content.replace(analyze_old, analyze_new)

analyze_success_old = r'        return result'
analyze_success_new = """
        # log success
        audit_entry = AuditLog(scan_id=scan.id, action="analyze", status="success")
        db.add(audit_entry)
        db.commit()
        return result
"""
content = content.replace(analyze_success_old, analyze_success_new.strip('\n'))

analyze_value_error_old = r'        raise HTTPException\(status_code=422, detail=str\(exc\)\)'
analyze_value_error_new = """
        # log failure
        audit_entry = AuditLog(scan_id=scan.id, action="analyze", status="failed")
        db.add(audit_entry)
        db.commit()
        raise HTTPException(status_code=422, detail=str(exc))
"""
content = re.sub(analyze_value_error_old, analyze_value_error_new.strip('\n'), content)

analyze_exception_old = r'        raise HTTPException\(status_code=500, detail=str\(exc\)\)'
analyze_exception_new = """
        # log failure
        audit_entry = AuditLog(scan_id=scan.id if 'scan' in locals() and hasattr(scan, 'id') else "unknown", action="analyze", status="failed")
        db.add(audit_entry)
        db.commit()
        raise HTTPException(status_code=500, detail=str(exc))
"""
# Since analyze and chat both have Exception block, let's just do targeted replacements.
content = re.sub(r'(logger\.error\(f"❌  /analyze failed: \{exc\}"\)\n)        raise HTTPException\(status_code=500, detail=str\(exc\)\)',
                 r'\1' + analyze_exception_new.strip('\n'), content)

# 4. Update chat signature and body
chat_old = r'async def chat\(request: ChatRequest\):'
chat_new = 'async def chat(request: ChatRequest, db: Session = Depends(get_db)):'
content = content.replace(chat_old, chat_new)

chat_success_old = r'        return ChatResponse\(answer=answer\)'
chat_success_new = """
        # log success
        audit_entry = AuditLog(scan_id="chat", action="chat", status="success")
        db.add(audit_entry)
        db.commit()
        return ChatResponse(answer=answer)
"""
content = content.replace(chat_success_old, chat_success_new.strip('\n'))

chat_exception_old = r'(logger\.error\(f"❌  /chat failed: \{exc\}"\)\n)        raise HTTPException\(status_code=500, detail=str\(exc\)\)'
chat_exception_new = """
        # log failure
        audit_entry = AuditLog(scan_id="chat", action="chat", status="failed")
        db.add(audit_entry)
        db.commit()
        raise HTTPException(status_code=500, detail=str(exc))
"""
content = re.sub(chat_exception_old, r'\1' + chat_exception_new.strip('\n'), content)

with open("ai-service/main.py", "w") as f:
    f.write(content)

