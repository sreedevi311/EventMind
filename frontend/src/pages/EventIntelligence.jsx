import { useState } from "react";
import { Bot, Send, Sparkles, BrainCircuit, TrendingUp, Users, CalendarDays, AlertTriangle } from "lucide-react";
import "./AIShared.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function EventIntelligence() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState([]);

  const ask = async () => {
    if (!message.trim() || loading) return;

    const text = message.trim();
    setChat((c) => [...c, { role: "user", text }]);
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/event-intelligence/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      setChat((c) => [
        ...c,
        {
          role: "ai",
          text: data.message || "I couldn't generate an intelligence response.",
          insights: data.insights,
        },
      ]);
    } catch {
      setChat((c) => [
        ...c,
        { role: "ai", text: "Unable to connect to the Event Intelligence Engine." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const latestInsights = [...chat].reverse().find((x) => x.role === "ai")?.insights;

  return (
    <div className="ai-page">
      <div className="ai-page-header">
        <div>
          <div className="ai-eyebrow"><Sparkles size={15} /> AI POWERED</div>
          <h1>Event Intelligence</h1>
          <p>Ask questions and get AI-powered insights across your entire event operation.</p>
        </div>
        <div className="ai-header-icon"><BrainCircuit size={27} /></div>
      </div>

      <div className="ai-layout">
        <section className="ai-chat-card">
          <div className="ai-card-header">
            <div className="ai-agent-avatar"><Bot size={21} /></div>
            <div>
              <h2>Event Intelligence Engine</h2>
              <span><i className="ai-online-dot" /> Online</span>
            </div>
          </div>

          <div className="ai-messages">
            {chat.length === 0 && (
              <div className="ai-empty">
                <div className="ai-empty-icon"><Sparkles size={28} /></div>
                <h3>How can I help?</h3>
                <p>Ask about registrations, sessions, sponsors, incidents, risks, or overall event performance.</p>
                <div className="ai-suggestions">
                  {[
                    "How is the overall event health?",
                    "Which areas need immediate attention?",
                    "Summarize registrations and attendance",
                    "Are there any operational risks?"
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
                  ask();
                }
              }}
              placeholder="Ask the Event Intelligence Engine..."
              rows={1}
            />
            <button className="ai-send" onClick={ask} disabled={!message.trim() || loading}>
              <Send size={18} />
            </button>
          </div>
        </section>

        <aside className="ai-insights-panel">
          <div className="panel-title">
            <div><Sparkles size={17} /> Current Insights</div>
          </div>

          {latestInsights ? (
            <div className="insight-grid">
              <Insight icon={<Users />} label="Registrations" value={latestInsights.registrationSummary?.total ?? "—"} />
              <Insight icon={<CalendarDays />} label="Sessions" value={latestInsights.sessionSummary?.total ?? "—"} />
              <Insight icon={<TrendingUp />} label="Sponsors" value={latestInsights.sponsorSummary?.total ?? "—"} />
              <Insight icon={<AlertTriangle />} label="Incidents" value={latestInsights.incidentSummary?.total ?? "—"} />
            </div>
          ) : (
            <div className="insight-placeholder">
              <BrainCircuit size={30} />
              <p>Insights from your latest AI analysis will appear here.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Insight({ icon, label, value }) {
  return (
    <div className="insight-card">
      <div className="insight-icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
