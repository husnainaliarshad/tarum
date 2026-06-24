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

        // Set the active chat state to the new session
        setCurrentChat(chat);

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
                className="lg:hidden fixed inset-0 bg-black/60 z-30 backdrop-blur-xs transition-opacity"
                onClick={() => setSidebarOpen(false)}
                aria-hidden="true"
              />
              <div className="lg:hidden fixed left-[16px] top-[96px] bottom-[86px] w-[calc(100%-32px)] sm:w-[380px] bg-[#181816]/98 border border-[#3b3633] rounded-[22px] z-40 flex flex-col shadow-2xl overflow-hidden animate-slideUp">
                <div className="flex items-center justify-between px-[18px] py-[14px] border-b border-[#3b3633] shrink-0">
                  <h2 className="text-[15px] font-extrabold text-white">Create Image</h2>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="w-[28px] h-[28px] rounded-full bg-[#272421] border border-[#3b3633] flex items-center justify-center text-white cursor-pointer hover:bg-[#34302c] transition-colors"
                    aria-label="Close panel"
                  >
                    <i className="fas fa-times text-[10px]" />
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
          className="w-full max-w-[500px] h-[50px] rounded-full bg-[#272421]/95 border border-[#3b3633] px-[20px] flex items-center justify-between shadow-lg backdrop-blur-md cursor-pointer hover:border-[#4a433f] transition-all pointer-events-auto"
        >
          <span className="text-[#898681] text-[12px] font-bold">
            Tap to create your image...
          </span>
          <button
            type="button"
            className="w-[32px] h-[32px] rounded-full bg-[#3b3937] hover:bg-[#4a4846] flex items-center justify-center text-white cursor-pointer transition-colors"
            aria-label="Quick create"
          >
            <i className="fas fa-bolt text-[11px] text-[#aaa6a0]" />
          </button>
        </div>
      </div>

      {/* ===== BOTTOM NAVIGATION BAR (lg:hidden) ===== */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-[70px] bg-[#1e1c1a]/95 border-t border-[#343330] flex items-center justify-around px-4 z-30 pb-safe shadow-xl shrink-0">
        <button
          type="button"
          className="flex flex-col items-center gap-1 text-[#aaa6a0] hover:text-white transition-colors cursor-pointer"
          aria-label="Home"
        >
          <i className="fas fa-home text-[16px]" />
          <span className="text-[9px] font-bold">Home</span>
        </button>
        <button
          type="button"
          className="flex flex-col items-center gap-1 text-[#aaa6a0] hover:text-white transition-colors cursor-pointer"
          aria-label="Community"
        >
          <i className="fas fa-users text-[16px]" />
          <span className="text-[9px] font-bold">Community</span>
        </button>
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="w-[50px] h-[34px] rounded-[10px] bg-[#c9785f] hover:bg-[#d9886f] flex items-center justify-center text-white text-[14px] cursor-pointer shadow-md transition-colors"
          aria-label="Create new"
        >
          <i className="fas fa-magic" />
        </button>
        <button
          type="button"
          className="flex flex-col items-center gap-1 text-[#aaa6a0] hover:text-white transition-colors cursor-pointer"
          aria-label="Assets"
        >
          <i className="fas fa-folder text-[16px]" />
          <span className="text-[9px] font-bold">Assets</span>
        </button>
        <button
          type="button"
          className="flex flex-col items-center gap-1 text-[#aaa6a0] hover:text-white transition-colors cursor-pointer"
          aria-label="Profile"
        >
          <i className="fas fa-user text-[16px]" />
          <span className="text-[9px] font-bold">Profile</span>
        </button>
      </nav>
    </div>
  );
}
