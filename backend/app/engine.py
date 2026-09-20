import re
from typing import Any

INJECTION_PATTERNS = [
    (r"ignore\s+(all\s+)?previous\s+instructions", "Instruction override"),
    (r"ignore\s+(the\s+)?system\s+message", "System prompt override"),
    (r"developer\s+message", "Developer-message impersonation"),
    (r"you\s+are\s+now\s+in\s+developer", "Role hijacking"),
    (r"reveal\s+(the\s+)?system\s+prompt", "Prompt extraction"),
    (r"disregard\s+your\s+rules", "Policy bypass"),
    (r"send\s+.*(api|secret|token|password|credential)", "Credential exfiltration intent"),
]
SECRET_PATTERNS = [
    (r"sk-[A-Za-z0-9_-]{12,}", "API key"),
    (r"AKIA[0-9A-Z]{16}", "AWS access key"),
    (r"(?i)api[_-]?key\s*[:=]\s*['\"]?[A-Za-z0-9_\-]{8,}", "API key"),
    (r"(?i)(password|passwd)\s*[:=]\s*\S+", "Password"),
    (r"(?i)authorization:\s*bearer\s+\S+", "Bearer token"),
    (r"(?i)-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----", "Private key"),
]
DANGEROUS_ACTIONS = {
    "send_email": 35, "http_request": 30, "execute_command": 45,
    "read_file": 20, "delete_file": 40, "database_write": 35,
    "transfer_funds": 50, "page_read": 5, "web_search": 0,
    "database_read": 5,
}
SENSITIVE_PATHS = [".env", ".ssh", "credentials", "secrets", "id_rsa", "password"]

def _matches(text: str, patterns: list[tuple[str, str]]) -> list[dict[str, str]]:
    return [{"type":label,"pattern":pattern} for pattern,label in patterns if re.search(pattern,text,flags=re.IGNORECASE|re.DOTALL)]

def analyze(payload: dict[str, Any]) -> dict[str, Any]:
    content=str(payload.get("content", "")); action=payload.get("action") or {}
    action_name=str(action.get("tool", "")); action_args=str(action.get("arguments", ""))
    combined=f"{content}\n{action_name}\n{action_args}"
    injections=_matches(combined,INJECTION_PATTERNS); secrets=_matches(combined,SECRET_PATTERNS)
    sensitive_paths=[p for p in SENSITIVE_PATHS if p.lower() in combined.lower()]
    score=min(99,min(55,len(injections)*24)+min(40,len(secrets)*30)+DANGEROUS_ACTIONS.get(action_name,0)+(55 if sensitive_paths and action_name in {'read_file','delete_file'} else (25 if sensitive_paths else 0))+(20 if re.search(r"https?://[^\s]+",combined) and (secrets or injections) else 0))
    if score>=70: decision="BLOCK"; level="CRITICAL" if score>=90 else "HIGH"
    elif score>=35: decision="REVIEW"; level="MEDIUM"
    else: decision="ALLOW"; level="LOW"
    reasons=[]
    if injections: reasons.append("Untrusted content contains instructions attempting to override agent behavior.")
    if secrets: reasons.append("Potential credentials or authentication material were detected in the payload.")
    if sensitive_paths: reasons.append("The requested resource resembles a sensitive file or credential store.")
    if action_name in DANGEROUS_ACTIONS and DANGEROUS_ACTIONS[action_name] > 0: reasons.append(f"Tool '{action_name}' can create an external side effect and requires policy scrutiny.")
    if not reasons: reasons.append("No high-risk instruction, secret, or dangerous side effect was detected.")
    return {"decision":decision,"risk_score":score,"risk_level":level,"threats":[x["type"] for x in injections],"secrets":[x["type"] for x in secrets],"sensitive_paths":sensitive_paths,"reasons":reasons,"trace":[{"step":1,"label":"INPUT NORMALIZED","status":"complete"},{"step":2,"label":"THREAT PATTERNS SCANNED","status":"complete"},{"step":3,"label":"SENSITIVE DATA SCANNED","status":"complete"},{"step":4,"label":"POLICY EVALUATED","status":"complete"},{"step":5,"label":f"DECISION: {decision}","status":"blocked" if decision=="BLOCK" else "complete"}]}
