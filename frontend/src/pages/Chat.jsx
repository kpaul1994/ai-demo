import { useState, useRef, useEffect } from "react";
import { api } from "../lib/api";
import Layout from "../components/Layout";

const SUGGESTIONS = [
  "Which products should I focus on?",
  "Why are sales declining?",
  "Who should I target with a campaign?",
  "What should I do this week?",
  "Which products are running low on stock?",
];

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text) {
    const question = (text ?? input).trim();
    if (!question || loading) return;

    const now = formatTime();
    const nextMessages = [...messages, { role: "user", content: question, time: now }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    inputRef.current?.focus();

    try {
      const { reply } = await api.chat(question, messages.map(({ role, content }) => ({ role, content })));
      setMessages([...nextMessages, { role: "assistant", content: reply, time: formatTime() }]);
    } catch (err) {
      setMessages([...nextMessages, { role: "assistant", content: `Sorry, something went wrong: ${err.message}`, time: formatTime(), isError: true }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="page-title">Ask AI</h1>
          <p className="page-subtitle">Ask anything about your store's performance and data.</p>
        </div>
        {messages.length > 0 && (
          <button className="btn btn-ghost" onClick={() => setMessages([])}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
            </svg>
            New chat
          </button>
        )}
      </div>

      <div className="chat-window">
        {/* Messages */}
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <div className="chat-empty-icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink-soft)", marginBottom: 4 }}>AI Store Assistant</div>
                <div style={{ fontSize: 13, color: "var(--ink-muted)" }}>
                  Ask me anything about your Shopify store data and I'll give you data-driven answers.
                </div>
              </div>
              <div className="chat-suggestions">
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="chat-suggestion-pill" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i}>
                <div
                  className={`chat-bubble ${m.role}`}
                  style={m.isError ? { borderColor: "var(--red-border)", color: "var(--red)" } : {}}
                >
                  {m.content}
                </div>
                <div style={{
                  fontSize: 10.5,
                  color: "var(--ink-muted)",
                  marginTop: 4,
                  textAlign: m.role === "user" ? "right" : "left",
                  paddingLeft: m.role === "assistant" ? 4 : 0,
                  paddingRight: m.role === "user" ? 4 : 0,
                }}>
                  {m.role === "assistant" && "🤖 AI · "}{m.time}
                </div>
              </div>
            ))
          )}

          {/* Typing indicator */}
          {loading && (
            <div className="typing-indicator">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Input */}
        <form
          className="chat-input-row"
          onSubmit={(e) => { e.preventDefault(); send(); }}
        >
          <input
            ref={inputRef}
            id="chat-input"
            className="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your store…"
            disabled={loading}
          />
          <button
            id="chat-send-btn"
            type="submit"
            className="btn btn-primary"
            disabled={loading || !input.trim()}
            style={{ padding: "10px 20px" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            Send
          </button>
        </form>
      </div>
    </Layout>
  );
}
