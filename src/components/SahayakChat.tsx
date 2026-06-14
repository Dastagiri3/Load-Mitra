import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Search, MapPin, Sparkles, Send, Loader2, Link2, Compass, AlertCircle } from "lucide-react";

interface GroundingChunk {
  web?: {
    title: string;
    uri: string;
  };
  maps?: {
    title: string;
    uri: string;
  };
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  groundingChunks?: GroundingChunk[];
  mode?: "standard" | "search" | "maps";
}

export default function SahayakChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial-1",
      role: "assistant",
      content: "Namaste! Main hoon aapka LoadMitra Sahayak (लॉडमित्र सहायक). 🙏\n\nIndian highways, direct zero-commission cargo bidding, route optimization, toll pricing (FastTag), ya logistics tax queries ke baare mein kuch bhi puchiye! Aap direct standard chat kar sakte hain, ya Google Web Search ya live Google Maps and locations grounding on kar sakte hain.",
    }
  ]);
  const [inputMsg, setInputMsg] = useState("");
  const [chatMode, setChatMode] = useState<"standard" | "search" | "maps">("standard");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || loading) return;

    const userMessageText = inputMsg.trim();
    setInputMsg("");

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: "user",
      content: userMessageText,
      mode: chatMode
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      let endpoint = "/api/gemini/chat";
      let payload: any = {};

      if (chatMode === "search") {
        endpoint = "/api/gemini/search-grounding";
        payload = { query: userMessageText };
      } else if (chatMode === "maps") {
        endpoint = "/api/gemini/maps-grounding";
        // Grab current geolocation if active
        let lat: number | undefined;
        let lng: number | undefined;

        if (navigator.geolocation) {
          try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
            });
            lat = pos.coords.latitude;
            lng = pos.coords.longitude;
          } catch (geoErr) {
            console.log("No browser geolocation access, continuing with fallback center.", geoErr);
          }
        }

        payload = {
          query: userMessageText,
          latitude: lat,
          longitude: lng
        };
      } else {
        // Standard Chat - includes previous conversation message thread context
        // Ensure we send up to past 8 messages for robust multi-turn Q&A
        const thread = messages
          .concat(userMsg)
          .map((m) => ({
            role: m.role,
            content: m.content
          }))
          .slice(-8);

        payload = { messages: thread };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Sahayak AI API connection issue");
      }

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: data.text,
          groundingChunks: data.groundingChunks || []
        }
      ]);
    } catch (err: any) {
      console.error("AI Assistant response failure:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: "assistant",
          content: "❌ Maaf kijiye, humare servers se contact nahi ho paaya. Please make sure your API key is configured correctly in Settings."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Safe formatting to handle basic newlines and list stars safely
  const formatText = (text: string) => {
    return text.split("\n").map((line, i) => {
      let trimmed = line.trim();
      if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        return <strong key={i} className="block font-bold text-amber-400 mt-2 mb-1">{trimmed.replace(/\*\*/g, "")}</strong>;
      }
      if (trimmed.startsWith("*")) {
        return (
          <li key={i} className="list-disc list-inside ml-2 text-slate-300 py-0.5 font-sans">
            {trimmed.substring(1).trim()}
          </li>
        );
      }
      return <p key={i} className="text-slate-200 leading-relaxed py-1 font-sans text-sm">{trimmed}</p>;
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col h-[600px] w-full" id="sahayak-chat-workspace">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 header-font">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
            <span>LoadMitra Sahayak Chatbot</span>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono uppercase tracking-wider">Beta</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Multi-turn AI Assistant grounded with modern Google Search & Google Maps technology.</p>
        </div>

        {/* Feature Grounding Switch Docks */}
        <div className="flex bg-slate-950 p-1 border border-slate-800 rounded-xl gap-1">
          <button
            onClick={() => setChatMode("standard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              chatMode === "standard"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Continuous Thread Conversation"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Standard</span>
          </button>
          
          <button
            onClick={() => setChatMode("search")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              chatMode === "search"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Google Search Grounded (Latest pricing, weather, blocks)"
          >
            <Search className="w-3.5 h-3.5" />
            <span>G-Search</span>
          </button>

          <button
            onClick={() => setChatMode("maps")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              chatMode === "maps"
                ? "bg-amber-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Google Maps Location Grounded (Dhabas, Weighbridges, yards)"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>G-Maps</span>
          </button>
        </div>
      </div>

      {/* Scrollable messages container */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col max-w-[85%] ${
              m.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
            }`}
          >
            {/* Metadata node */}
            <span className="text-[10px] font-mono text-slate-500 mb-1 flex items-center gap-1">
              {m.role === "user" ? "You" : "Sahayak AI"}
              {m.mode && m.mode !== "standard" && (
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/15 capitalize">
                  via {m.mode} Grounding
                </span>
              )}
            </span>

            {/* Bubble body */}
            <div
              className={`rounded-2xl p-4 shadow-md ${
                m.role === "user"
                  ? "bg-amber-500 text-slate-950 rounded-tr-none font-medium"
                  : "bg-slate-950 text-slate-200 rounded-tl-none border border-slate-800/80"
              }`}
            >
              {m.role === "user" ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
              ) : (
                <div className="space-y-1.5">
                  {formatText(m.content)}
                </div>
              )}
            </div>

            {/* Render any grounding link citations */}
            {m.groundingChunks && m.groundingChunks.length > 0 && (
              <div className="mt-2 w-full space-y-1.5">
                <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1">
                  <Compass className="w-3 h-3 text-amber-500 animate-spin" /> Verifiable Grounded References
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                  {m.groundingChunks.map((chunk, idx) => {
                    const link = chunk.web || chunk.maps;
                    if (!link) return null;
                    const isMap = !!chunk.maps;

                    return (
                      <a
                        key={idx}
                        href={link.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:border-amber-500/50 hover:text-amber-400 transition"
                      >
                        {isMap ? (
                          <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />
                        ) : (
                          <Link2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        )}
                        <span className="truncate flex-1 font-sans">{link.title || link.uri}</span>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-500 text-xs pl-2">
            <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
            <span>Sahayak AI is processing latest transport parameters...</span>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Grounding guidelines info note */}
      <div className="bg-slate-950/40 border border-slate-800/40 p-2.5 rounded-2xl flex items-center gap-2 text-[11px] text-slate-400 mt-4">
        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span>
          {chatMode === "standard" && "Standard Thread: Best for quick logistics advice, bidding tips & driver help."}
          {chatMode === "search" && "G-Search Grounding: Searches live internet web indices for active fuel rates or cargo policies."}
          {chatMode === "maps" && "G-Maps Grounding: Matches verified geographic details for transport centers and highway dhabas."}
        </span>
      </div>

      {/* Input container dock */}
      <form onSubmit={handleSendMessage} className="mt-3 flex items-center gap-2 bg-slate-950 p-1.5 border border-slate-800 rounded-2xl">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder={
            chatMode === "standard"
              ? "Ask general logistics questions (e.g., 'How to clear GST bills?')..."
              : chatMode === "search"
              ? "Submit search grounded query (e.g., 'Current diesel rate in Punjab')..."
              : "Ask location grounded details (e.g., 'Parking yards in Sanjay Gandhi Nagar')..."
          }
          className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0"
        />
        <button
          type="submit"
          disabled={!inputMsg.trim() || loading}
          className="bg-amber-500 hover:bg-amber-400 disabled:bg-slate-850 text-slate-950 p-2.5 rounded-xl transition shadow flex items-center justify-center shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
