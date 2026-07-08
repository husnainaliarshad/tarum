"use client";

import { useState, useEffect, useCallback } from "react";

export default function HistoryPanel({ currentChatId, onSelectChat, onNewChat }) {
  const [chats, setChats] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch("/api/chats");
      const data = await res.json();
      setChats(data.chats || []);
    } catch (err) {
      console.error("Failed to fetch chats:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [fetchChats, currentChatId]);

  const handleNewChat = async () => {
    try {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Chat" }),
      });
      const data = await res.json();
      if (data.chat) {
        onNewChat(data.chat);
        fetchChats();
      }
    } catch (err) {
      console.error("Failed to create chat:", err);
    }
  };

  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    try {
      await fetch(`/api/chats/${chatId}`, { method: "DELETE" });
      if (currentChatId === chatId) {
        onNewChat(null);
      }
      fetchChats();
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  const displayChats = showAll ? chats : chats.slice(0, 5);

  return (
    <section className="panel rounded-[5px] shrink-0 h-full" aria-label="History panel">
      <div className="flex h-full items-stretch">
        {/* History button */}
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          aria-label={showAll ? "Show less history" : "View all history"}
          className="w-[95px] m-[9px] mr-0 soft rounded-[2px] flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity shrink-0"
        >
          <i className="far fa-clock text-[var(--text-muted)] text-[16px]" />
          <div className="text-[13px] font-extrabold mt-1">History</div>
          <div className="micro muted font-bold">{showAll ? "Show Less" : "View All"}</div>
        </button>

        {/* New chat button */}
        <button
          type="button"
          onClick={handleNewChat}
          aria-label="Start new chat"
          className="w-[100px] m-[9px] soft rounded-[2px] flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity shrink-0"
        >
          <i className="fas fa-plus text-[var(--text-muted)] text-[20px]" />
          <div className="micro muted font-bold mt-2">New chat</div>
        </button>

        {/* Chat list or empty state */}
        <div className="flex-1 flex items-center overflow-hidden min-w-0">
          {loading ? (
            <div className="text-[var(--text-muted)] text-[12px] font-extrabold ml-[17px]">
              Loading...
            </div>
          ) : displayChats.length > 0 ? (
            <div className="flex-1 flex items-center gap-[9px] overflow-x-auto scrollbar-none py-2 h-full">
              {displayChats.map((chat) => (
                <div
                  key={chat.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectChat(chat)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelectChat(chat);
                    }
                  }}
                  aria-label={`Chat: ${chat.title}`}
                  className={`group relative flex-shrink-0 w-[85px] sm:w-[95px] h-[72px] sm:h-[77px] rounded-[5px] overflow-hidden text-left transition-all border-2 cursor-pointer ${
                    currentChatId === chat.id
                      ? "border-[var(--brand-accent)] shadow-[0_0_8px_rgba(201,120,95,0.4)]"
                      : "border-[var(--border-primary)] hover:border-[var(--border-secondary)]"
                  }`}
                >
                  {chat.thumbnail ? (
                    <img
                      src={chat.thumbnail}
                      alt={chat.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--chat-gradient-from)] to-[var(--chat-gradient-to)] flex flex-col items-center justify-center p-2 text-center">
                      <i className="far fa-image text-[14px] text-[var(--text-muted)] mb-1" />
                      <div className="text-[7px] font-extrabold text-[var(--text-muted)] truncate w-full">
                        {chat.title}
                      </div>
                    </div>
                  )}

                  {/* Title overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 px-[6px] py-[4px] text-[7px] font-extrabold text-stone-200 truncate backdrop-blur-xs">
                    {chat.title}
                  </div>

                  {/* Delete button on hover — div with role="button" avoids nested <button> */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleDeleteChat(e, chat.id);
                      }
                    }}
                    aria-label={`Delete ${chat.title}`}
                    className="absolute top-[4px] right-[4px] w-[20px] h-[20px] rounded-full bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-900/90 text-white cursor-pointer touch-manipulation"
                  >
                    <i className="fas fa-times text-[6px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[var(--text-muted)] text-[12px] font-extrabold ml-[17px]">
              No history yet
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
