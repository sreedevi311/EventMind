import { useState } from "react";
import { Bot, Send, Sparkles, Workflow, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import "./AIShared.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const agentNames = {
  registration: "Registration Agent",
  venue: "Venue Agent",
  speaker: "Speaker Agent",
  sponsorship: "Sponsorship Agent",
  incident: "Incident Agent",
  intelligence: "Event Intelligence Engine",
};

export default function AgentOrchestrator() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState([]);
  const [workflow, setWorkflow] = useState([]);

  const run = async () => {
    if (!message.trim() || loading) return;

    const text = message.trim();
    setChat((c) => [...c, { role: "user", text }]);
    setMessage("");
    setLoading(true);
    setWorkflow([]);

    try {
      const res = await fetch(`${API_BASE}/agent-orchestrator/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      const agents = data.workflow?.agents || data.agents || [];
      setWorkflow(
        agents.map((agent) => ({
          name: agentNames[agent] || agent,
          status: "completed",
        }))
      );

      setChat((c) => [
        ...c,
        { role: "ai", text: data.message || "Workflow completed." },
      ]);
    } catch {
      setWorkflow([{ name: "Orchestrator", status: "failed" }]);
      setChat((c) => [
        ...c,
        { role: "ai", text: "Unable to connect to the Agent Orchestrator." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-page">
      <div className="ai-page-header">
        <div>
          <div className="ai-eyebrow"><Sparkles size={15} /> MULTI-AGENT AI</div>
          <h1>Agent Orchestrator</h1>
          <p>Coordinate specialized AI agents to solve complex event operations.</p>
        </div>
        <div className="ai-header-icon"><Workflow size={27} /></div>
      </div>

      <div className="orchestrator-layout">
        <section className="ai-chat-card">
          <div className="ai-card-header">
            <div className="ai-agent-avatar"><Workflow size={21} /></div>
            <div>
              <h2>AI Agent Orchestrator</h2>
              <span><i className="ai-online-dot" /> Ready to coordinate</span>
            </div>
          </div>

          <div className="ai-messages">
            {chat.length === 0 && (
              <div className="ai-empty">
                <div className="ai-empty-icon"><Workflow size={28} /></div>
                <h3>Coordinate your event operations</h3>
                <p>Describe a complex situation. The orchestrator will determine which agents need to work together.</p>
                <div className="ai-suggestions">
                  {[
                    "A speaker cancelled today's session",
                    "A venue has a technical problem",
                    "Analyze the current event risks",
                    "A large crowd is expected at the venue"
                  ].map((q) => (
                    <button key={q} onClick={() => setMessage(q)}>{q}</button>
                  ))}
                </div>
              </div>
            )}

            {chat.map((item, i) => (
              <div className={`ai-message-row ${item.role}`} key={i}>
                {item.role === "ai" && <div className="mini-avatar"><Bot size={15} /></div>}
                <div className="ai-message-bubble">
                  <div className="ai-message-text">{item.text}</div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="ai-message-row ai">
                <div className="mini-avatar"><Bot size={15} /></div>
                <div className="ai-message-bubble typing"><span /><span /><span /></div>
              </div>
            )}
          </div>

          <div className="ai-input-wrap">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  run();
                }
              }}
              placeholder="Describe an event operation or problem..."
              rows={1}
            />
            <button className="ai-send" onClick={run} disabled={!message.trim() || loading}>
              <Send size={18} />
            </button>
          </div>
        </section>

        <aside className="workflow-panel">
          <div className="panel-title">
            <div><Workflow size={17} /> Agent Workflow</div>
            {loading && <Loader2 className="spin" size={17} />}
          </div>

          {workflow.length === 0 ? (
            <div className="insight-placeholder">
              <Workflow size={30} />
              <p>Agents involved in the current workflow will appear here.</p>
            </div>
          ) : (
            <div className="workflow-list">
              {workflow.map((agent, i) => (
                <div className="workflow-item" key={`${agent.name}-${i}`}>
                  <div className="workflow-line">
                    <div className={`workflow-status ${agent.status}`}>
                      {agent.status === "completed" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    </div>
                    {i < workflow.length - 1 && <div className="workflow-connector" />}
                  </div>
                  <div className="workflow-content">
                    <strong>{agent.name}</strong>
                    <span>{agent.status === "completed" ? "Completed" : "Failed"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="orchestration-note">
            <Sparkles size={15} />
            <span>The orchestrator selects agents, manages task order, passes context between agents, and produces a final response.</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
