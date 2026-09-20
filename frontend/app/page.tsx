'use client';

import { useEffect, useMemo, useState } from 'react';
import { Shield, Activity, Bot, LockKeyhole, Radar, Play, CheckCircle2, XCircle, RotateCcw, Database, Globe, Terminal, BrainCircuit, ArrowRight, CircleDot, AlertTriangle } from 'lucide-react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

type AgentTrace = {step:number;type:string;title:string;detail:string;status:string;risk:number;tool:string;timestamp:string};
type AgentRun = {run_id:string;scenario:string;goal:string;status:string;decision:string;risk_score:number;blocked_actions:number;allowed_actions:number;memory:string[];trace:AgentTrace[]};

type Scenario = {id:string;name:string;goal:string};

export default function Home(){
  const [tab,setTab]=useState<'mission'|'firewall'|'threats'>('mission');
  const [scenario,setScenario]=useState('research-competitor');
  const [scenarios,setScenarios]=useState<Scenario[]>([]);
  const [run,setRun]=useState<AgentRun|null>(null);
  const [running,setRunning]=useState(false);
  const [visible,setVisible]=useState(0);

  useEffect(()=>{fetch(`${API}/api/agent/scenarios`).then(r=>r.json()).then(setScenarios).catch(()=>{});},[]);
  useEffect(()=>{ if(run){setVisible(0); const id=setInterval(()=>setVisible(v=>Math.min(v+1,run.trace.length)),480); return ()=>clearInterval(id);} },[run]);

  async function launch(){
    setRunning(true); setRun(null); setVisible(0);
    try{const r=await fetch(`${API}/api/agent/run`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({scenario_id:scenario})}); setRun(await r.json());}
    catch(e){console.error(e)} finally{setRunning(false)}
  }

  const shown=run?.trace.slice(0,visible) || [];
  const blocked=run?.blocked_actions ?? 0;
  const score=run?.risk_score ?? 0;

  return <main className="app">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Shield size={22}/></div><div><b>AEGIS</b><span>AUTONOMOUS DEFENSE</span></div></div>
      <div className="engine"><span className="pulse"/> ENGINE ONLINE <b>v2.0</b></div>
      <nav>
        <Nav active={tab==='mission'} onClick={()=>setTab('mission')} icon={<Bot size={17}/>} text="Agent Mission"/>
        <Nav active={tab==='firewall'} onClick={()=>setTab('firewall')} icon={<LockKeyhole size={17}/>} text="Action Firewall"/>
        <Nav active={tab==='threats'} onClick={()=>setTab('threats')} icon={<Radar size={17}/>} text="Threat Center"/>
      </nav>
      <div className="side-bottom"><div className="mono-label">TRUST BOUNDARY</div><div className="trust"><Shield size={15}/> ACTIVE</div><p>Every external instruction is treated as untrusted data until policy evaluation completes.</p></div>
    </aside>

    <section className="main">
      <header className="top"><div><div className="kicker">AEGIS CONTROL PLANE / AUTONOMOUS MODE</div><h1>{tab==='mission'?'Agent Mission':tab==='firewall'?'Action Firewall':'Threat Center'}</h1></div><div className="top-status"><span className="green-dot"/> LIVE DEMO ENVIRONMENT <span className="separator"/> <span className="mono">POLICY: STRICT</span></div></header>

      {tab==='mission' && <>
        <section className="hero2">
          <div className="hero-copy"><div className="tag"><BrainCircuit size={14}/> AGENTIC SECURITY LOOP</div><h2>Let the agent act.<br/><em>Make Aegis decide.</em></h2><p>Aegis sits between an autonomous agent and the real world. It observes plans, inspects every tool call, detects hostile instructions, blocks unsafe actions and lets the agent recover without human micromanagement.</p><div className="hero-actions"><button className="run-btn" onClick={launch} disabled={running}><Play size={15}/>{running?'Agent running…':'Run autonomous mission'}</button><button className="reset" onClick={()=>{setRun(null);setVisible(0)}}><RotateCcw size={14}/> Reset</button></div></div>
          <div className="agent-visual"><div className="halo h1"/><div className="halo h2"/><div className="agent-core"><Bot size={35}/><span>AGENT</span></div><div className="shield-core"><Shield size={20}/></div><div className="orbit-label l1">PLAN</div><div className="orbit-label l2">TOOL</div><div className="orbit-label l3">POLICY</div></div>
        </section>

        <div className="mission-bar"><div><span className="mono-label">MISSION</span><b>{scenarios.find(s=>s.id===scenario)?.name || 'Autonomous Market Research'}</b></div><select value={scenario} onChange={e=>setScenario(e.target.value)}>{scenarios.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select><div className="mission-goal"><span className="mono-label">GOAL</span>{scenarios.find(s=>s.id===scenario)?.goal || 'Research safely'}</div></div>

        <div className="metrics"><Metric label="ACTIONS INTERCEPTED" value={run?String(blocked):'137'} suffix={run?`/ ${run.allowed_actions+blocked}`:'+9.2%'}/><Metric label="CURRENT RISK" value={run?String(score):'08'} suffix="/100"/><Metric label="AGENT STATE" value={run?'RECOVERED':'READY'} suffix=""/><Metric label="POLICY" value="STRICT" suffix=""/></div>

        <div className="work-grid">
          <section className="panel trace-panel"><div className="panel-title"><span>LIVE AGENT TRACE</span><span className={run?'live-badge':'muted'}>{run?'● RUNNING':'WAITING FOR MISSION'}</span></div>{!run&&!running?<Empty/>:<div className="trace-list">{shown.map((t,i)=><TraceRow key={t.step} t={t} index={i}/>) }{running && visible===0 && <div className="boot"><span className="loader"/> Initializing agent runtime…</div>}</div>}</section>
          <section className="panel decision-panel"><div className="panel-title"><span>SECURITY DECISION</span><span className="mono">{run?.run_id || 'NO RUN'}</span></div>{run?<><div className="decision-ring"><div><strong>{score}</strong><small>/100</small><span>RISK</span></div></div><div className="decision-word"><CheckCircle2 size={18}/><b>MISSION PROTECTED</b></div><p>The agent encountered an untrusted instruction, attempted an unsafe branch, and recovered through policy-controlled replanning.</p><div className="counts"><div><b>{blocked}</b><span>BLOCKED</span></div><div><b>{run.allowed_actions}</b><span>ALLOWED</span></div><div><b>{run.trace.length}</b><span>EVENTS</span></div></div></>:<div className="locked"><Shield size={34}/><b>Awaiting an agent run</b><span>Launch the mission to watch Aegis enforce the trust boundary in real time.</span></div>}</section>
        </div>

        {run && <section className="panel memory-panel"><div className="panel-title"><span>AGENT MEMORY / POLICY CONTEXT</span><span className="mono">PERSISTED FOR RUN</span></div><div className="memory-grid">{run.memory.map((m,i)=><div key={i}><span>0{i+1}</span>{m}</div>)}</div></section>}
      </>}

      {tab==='firewall' && <Firewall/>}
      {tab==='threats' && <Threats/>}
    </section>
  </main>
}

function Nav({active,onClick,icon,text}:{active:boolean;onClick:()=>void;icon:any;text:string}){return <button className={active?'nav active':'nav'} onClick={onClick}>{icon}<span>{text}</span></button>}
function Metric({label,value,suffix}:{label:string;value:string;suffix:string}){return <div className="metric"><span>{label}</span><b>{value}</b><small>{suffix}</small></div>}
function Empty(){return <div className="empty"><div className="empty-icon"><Bot size={25}/></div><b>Agent runtime is idle</b><span>Run a mission to generate an autonomous execution trace.</span></div>}
function TraceRow({t,index}:{t:AgentTrace;index:number}){const icon=t.type==='firewall'?<LockKeyhole size={15}/>:t.type==='threat'?<AlertTriangle size={15}/>:t.type==='tool'?<Terminal size={15}/>:t.type==='replan'?<RotateCcw size={15}/>:t.type==='plan'?<BrainCircuit size={15}/>:<Bot size={15}/>;return <div className={`trace-row ${t.status}`}><div className="trace-icon">{icon}</div><div className="trace-copy"><div><b>{t.title}</b><span className="trace-time">0{index+1}</span></div><p>{t.detail}</p>{t.tool&&<code>{t.tool}</code>}</div><div className="trace-status">{t.status==='blocked'?<><XCircle size={14}/> BLOCKED</>:t.status==='allowed'?<><CheckCircle2 size={14}/> ALLOWED</>:<><CircleDot size={14}/> {t.status.toUpperCase()}</>}</div></div>}

function Firewall(){const rows=[['web_search','Public web research','ALLOW','LOW'],['page_read','External content','INSPECT','LOW'],['read_file','.env / secrets','BLOCK','CRITICAL'],['send_email','External recipient','BLOCK','HIGH'],['database_write','Production records','REVIEW','HIGH'],['transfer_funds','Financial transaction','REVIEW','CRITICAL']];return <div className="page"><div className="intro"><div className="tag"><LockKeyhole size={14}/> POLICY GATEWAY</div><h2>Every tool call<br/><em>crosses the firewall.</em></h2><p>The agent never gets direct authority over side effects. Aegis evaluates intent, data sensitivity and destination before an action is allowed to execute.</p></div><div className="flow"><Node icon={<Bot/>} title="AGENT" sub="proposes"/><Arrow/><Node icon={<Shield/>} title="AEGIS" sub="evaluates" accent/><Arrow/><Node icon={<Globe/>} title="WORLD" sub="executes"/></div><section className="panel policy"><div className="panel-title"><span>LIVE POLICY MATRIX</span><span className="mono">6 RULES</span></div>{rows.map(r=><div className="policy-row" key={r[0]}><div><b>{r[0]}</b><span>{r[1]}</span></div><strong className={r[2].toLowerCase()}>{r[2]}</strong><small>{r[3]} RISK</small></div>)}</section></div>}
function Node({icon,title,sub,accent}:{icon:any;title:string;sub:string;accent?:boolean}){return <div className={accent?'node accent':'node'}>{icon}<b>{title}</b><span>{sub}</span></div>}
function Arrow(){return <ArrowRight size={22} className="flow-arrow"/>}
function Threats(){const events=[['CRITICAL','Prompt Injection','External content attempted to override agent instructions','just now'],['HIGH','Credential Exposure','.env requested after hostile webpage instruction','2 min ago'],['HIGH','Dangerous Tool Call','Shell execution crossed the side-effect policy','8 min ago'],['MEDIUM','Production Write','Database mutation held for review','16 min ago'],['LOW','Research Action','Public web search allowed','21 min ago']];return <div className="page"><div className="intro"><div className="tag"><Radar size={14}/> THREAT CENTER</div><h2>See what the<br/><em>agent tried to do.</em></h2><p>Security events are captured as an auditable chain instead of disappearing inside a model response.</p></div><section className="panel events">{events.map(e=><div className="event" key={e[1]}><strong className={e[0].toLowerCase()}>{e[0]}</strong><div><b>{e[1]}</b><p>{e[2]}</p></div><span>{e[3]}</span></div>)}</section></div>}
