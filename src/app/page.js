"use client";

import { useState, useCallback, useEffect } from "react";
import Header from "./components/Header";
import HistoryPanel from "./components/HistoryPanel";
import SidebarInput from "./components/SidebarInput";
import GeneratedContent from "./components/GeneratedContent";

export default function Home() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentChat, setCurrentChat] = useState(null);
  const [prefilledPrompt, setPrefilledPrompt] = useState("");
  const [prefilledMode, setPrefilledMode] = useState("image");

  // On mount, create or load the first chat
  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/chats");
        const data = await res.json();
        if (data.chats && data.chats.length > 0) {
          setCurrentChat(data.chats[0]);
        } else {
          // Create a default chat
          const createRes = await fetch("/api/chats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "New Chat" }),
          });
          const createData = await createRes.json();
          if (createData.chat) {
            setCurrentChat(createData.chat);
          }
        }
      } catch (err) {
        console.error("Failed to initialize chats:", err);
      }
    }
    init();
  }, []);

  const handleGenerate = useCallback(
    async (params) => {
      setLoading(true);
      setError(null);
      try {
        // Create a new chat session specifically for this generation
        const title = params.prompt
          ? (params.prompt.length > 25 ? params.prompt.substring(0, 25) + "..." : params.prompt)
          : `New ${params.mode} generation`;

        const createRes = await fetch("/api/chats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, mode: params.mode }),
        });
        const createData = await createRes.json();
        const chat = createData.chat;

        if (!chat) {
          throw new Error("Failed to create a new chat session");
        }

        // Save user message in the new session
        await fetch(`/api/chats/${chat.id}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: "user",
            content: params.prompt || `${params.mode} generation`,
            metadata: params,
          }),
        });

        // Call generation API
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(params),
        });
        if (!res.ok) throw new Error("Generation request failed");
        const data = await res.json();
        setResults(data.results);

        // Save assistant message with results in the new session
        await fetch(`/api/chats/${chat.id}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: "assistant",
            content: `Generated ${data.results.length} ${params.mode}(s)`,
            metadata: { results: data.results },
          }),
        });
        setCurrentChat(chat);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSelectChat = useCallback(async (chat) => {
    setCurrentChat(chat);
    // Load the last assistant message results if any
    try {
      const res = await fetch(`/api/chats/${chat.id}/messages`);
      const data = await res.json();
      const messages = data.messages || [];
      // Find the last assistant message with results
      for (let i = messages.length - 1; i >= 0; i--) {
        const msg = messages[i];
        if (msg.role === "assistant" && msg.metadata) {
          try {
            const meta = typeof msg.metadata === "string" ? JSON.parse(msg.metadata) : msg.metadata;
            if (meta.results) {
              setResults(meta.results);
              return;
            }
          } catch {}
        }
      }
      setResults(null);
    } catch {
      setResults(null);
    }
  }, []);

  const handleNewChat = useCallback((chat) => {
    setCurrentChat(chat);
    setResults(null);
    setError(null);
  }, []);

  const handleSelectTemplate = useCallback((template) => {
    setPrefilledPrompt(template.prompt || "");
    setPrefilledMode(template.mode || "image");
    setSidebarOpen(true); // open the panel on mobile
  }, []);

  return (
    <div className="w-screen h-screen bg-[var(--bg-primary)] relative flex flex-col overflow-hidden">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* ===== HISTORY PANEL — full width bar ===== */}
        <div className="shrink-0 px-4 lg:px-[44px] pt-[7px]">
          <div className="h-[95px]">
            <HistoryPanel
              currentChatId={currentChat?.id}
              onSelectChat={handleSelectChat}
              onNewChat={handleNewChat}
            />
          </div>
        </div>

        {/* ===== SIDEBAR + MAIN CONTENT ROW ===== */}
        <div className="flex-1 flex relative overflow-hidden">
          {/* ===== DESKTOP SIDEBAR (lg+) ===== */}
          <div className="hidden lg:flex flex-col pl-[44px] pr-[7px] pt-[7px] pb-[20px]">
            <div className="flex-1 min-h-0">
              <SidebarInput
                onGenerate={handleGenerate}
                prefilledPrompt={prefilledPrompt}
                prefilledMode={prefilledMode}
                onClearPrefill={() => setPrefilledPrompt("")}
              />
            </div>
          </div>

          {/* ===== MOBILE/TABLET CREATE IMAGE SHEET/MODAL ===== */}
          {sidebarOpen && (
            <>
              <div
                className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-sm transition-opacity"
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
              />
              <div className="lg:hidden fixed inset-x-4 top-[80px] sm:top-[88px] bottom-[86px] sm:w-[380px] sm:left-4 sm:right-auto bg-[var(--bg-primary)]/98 border border-[var(--border-primary)] rounded-[22px] z-50 flex flex-col shadow-2xl overflow-hidden animate-slideUp">
                <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-[var(--border-primary)] shrink-0">
                  <h2 className="text-[15px] font-extrabold text-[var(--text-primary)]">Create</h2>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="w-[36px] h-[36px] rounded-full panel flex items-center justify-center text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-tertiary)] transition-colors"
                    aria-label="Close panel"
                  >
                    <i className="fas fa-times text-[12px]" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto scrollbar-none p-1 pb-4">
                  <SidebarInput
                    onGenerate={(params) => {
                      handleGenerate(params);
                      setSidebarOpen(false);
                    }}
                    prefilledPrompt={prefilledPrompt}
                    prefilledMode={prefilledMode}
                    onClearPrefill={() => setPrefilledPrompt("")}
                  />
                </div>
              </div>
            </>
          )}

          {/* ===== MAIN CONTENT ===== */}
          <main className="flex-1 flex min-w-0 overflow-hidden">
            <GeneratedContent
              results={results}
              loading={loading}
              error={error}
              onSelectTemplate={handleSelectTemplate}
            />
          </main>
        </div>
      </div>

      {/* ===== FLOATING PROMPT INPUT (lg:hidden) ===== */}
      <div className="lg:hidden fixed bottom-[84px] left-0 right-0 px-4 z-20 flex justify-center pointer-events-none">
        <div
          onClick={() => setSidebarOpen(true)}
          className="w-full max-w-[500px] h-[52px] rounded-full bg-[var(--bg-secondary)]/95 border border-[var(--border-primary)] px-[20px] flex items-center justify-between shadow-lg backdrop-blur-md cursor-pointer active:scale-[0.98] hover:border-[var(--border-secondary)] transition-all pointer-events-auto"
        >
          <span className="text-[var(--text-muted)] text-[13px] font-bold">
            Tap to create your image...
          </span>
          <button
            type="button"
            className="w-[38px] h-[38px] rounded-full bg-[var(--bg-tertiary)] hover:bg-[var(--border-primary)] active:bg-[var(--brand-accent)] flex items-center justify-center text-[var(--text-primary)] cursor-pointer transition-colors shrink-0"
            aria-label="Quick create"
          >
            <i className="fas fa-bolt text-[13px] text-[var(--nav-icon)]" />
          </button>
        </div>
      </div>

      {/* ===== BOTTOM NAVIGATION BAR (lg:hidden) ===== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-[var(--nav-bg)]/95 border-t border-[var(--header-border)] flex items-center justify-around px-4 z-40 pb-safe shadow-lg shrink-0">
        <button
          type="button"
          className="flex flex-col items-center gap-[3px] text-[var(--nav-icon)] hover:text-[var(--text-primary)] transition-colors cursor-pointer touch-manipulation"
          aria-label="Home"
        >
          <i className="fas fa-home text-[18px]" />
          <span className="text-[9px] font-bold">Home</span>
        </button>
        <button
          type="button"
          className="flex flex-col items-center gap-[3px] text-[var(--nav-icon)] hover:text-[var(--text-primary)] transition-colors cursor-pointer touch-manipulation"
          aria-label="Community"
        >
          <i className="fas fa-users text-[18px]" />
          <span className="text-[9px] font-bold">Community</span>
        </button>
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="w-[54px] h-[36px] rounded-[10px] bg-[var(--brand-accent)] hover:opacity-80 active:scale-95 flex items-center justify-center text-white text-[18px] cursor-pointer shadow-md transition-all touch-manipulation"
          aria-label="Create new"
        >
          <i className="fas fa-magic" />
        </button>
        <button
          type="button"
          className="flex flex-col items-center gap-[3px] text-[var(--nav-icon)] hover:text-[var(--text-primary)] transition-colors cursor-pointer touch-manipulation"
          aria-label="Assets"
        >
          <i className="fas fa-folder text-[18px]" />
          <span className="text-[9px] font-bold">Assets</span>
        </button>
        <button
          type="button"
          className="flex flex-col items-center gap-[3px] text-[var(--nav-icon)] hover:text-[var(--text-primary)] transition-colors cursor-pointer touch-manipulation"
          aria-label="Profile"
        >
          <i className="fas fa-user text-[18px]" />
          <span className="text-[9px] font-bold">Profile</span>
        </button>
      </nav>
    </div>
  );
}
