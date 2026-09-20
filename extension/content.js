const text=(document.body?.innerText||'').slice(0,20000);
const patterns=[/ignore\s+(all\s+)?previous\s+instructions/i,/reveal\s+(the\s+)?system\s+prompt/i,/send\s+.*(api|secret|token|password)/i];
const threat=patterns.some(p=>p.test(text));
chrome.storage.local.set({aegisPage:{url:location.href,title:document.title,threat,checkedAt:new Date().toISOString()}});
