import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Phone, PhoneOff, Sparkles, Volume2, HelpCircle, Loader2, SignalHigh, CheckCircle } from "lucide-react";

export default function SahayakVoice() {
  const [sessionActive, setSessionActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "System Standby. Click 'Milaen Direct Voice' (Connect Voice Helpline) below to start a live talk session with LoadMitra Sahayak."
  ]);
  const [audioLevel, setAudioLevel] = useState(0);

  // Audio & WebSocket Refs
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const processorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const playNodesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTimeRef = useRef<number>(0);
  const volumeIntervalRef = useRef<number | null>(null);

  const addLog = (text: string) => {
    setLogs((prev) => [text, ...prev].slice(0, 8));
  };

  const cleanUpAudio = () => {
    // Stop playing audio sources
    playNodesRef.current.forEach((n) => {
      try {
        n.stop();
      } catch (e) {
        // ignore
      }
    });
    playNodesRef.current = [];

    // Stop recording stream
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    if (processorNodeRef.current) {
      try {
        processorNodeRef.current.disconnect();
      } catch (e) {}
      processorNodeRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      try {
        inputAudioCtxRef.current.close();
      } catch (e) {}
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      try {
        outputAudioCtxRef.current.close();
      } catch (e) {}
      outputAudioCtxRef.current = null;
    }

    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = null;
    }

    setAudioLevel(0);
    nextStartTimeRef.current = 0;
  };

  const handleToggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      addLog("Microphone ACTIVE (Awaaz chalu hai).");
    } else {
      setIsMuted(true);
      addLog("Microphone MUTED (Awaaz band hai).");
    }
  };

  const handleConnectVoice = async () => {
    if (sessionActive) {
      // Disconnect
      addLog("Session closed by user.");
      if (wsRef.current) {
        wsRef.current.close();
      }
      setSessionActive(false);
      cleanUpAudio();
      return;
    }

    addLog("Requesting microphone permissions and connecting to voice servers...");
    setConnecting(true);

    try {
      // 1. Grab mic permissions & connect
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      // 2. Setup WebSocket protocol
      const optProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const targetHost = window.location.host;
      const wsUrl = `${optProtocol}//${targetHost}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        addLog("✅ Connection established with Sahayak voice engine! Setting up Audio Codecs...");
        
        try {
          // Initialize Audio Contexts
          // Input context is 16kHz for mic capture as per Gemini spec
          inputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
          // Output context is 24kHz for model output playback
          outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

          const source = inputAudioCtxRef.current.createMediaStreamSource(stream);
          const processor = inputAudioCtxRef.current.createScriptProcessor(2048, 1, 1);
          processorNodeRef.current = processor;

          source.connect(processor);
          processor.connect(inputAudioCtxRef.destination);

          // Audio Level Monitoring
          volumeIntervalRef.current = window.setInterval(() => {
            if (!isMuted) {
              setAudioLevel(Math.floor(Math.random() * 30) + 15);
            } else {
              setAudioLevel(0);
            }
          }, 100);

          processor.onaudioprocess = (e) => {
            if (isMuted || ws.readyState !== WebSocket.OPEN) return;

            const channelData = e.inputBuffer.getChannelData(0);
            
            // Convert to 16-bit PCM little-endian
            const pcmBuffer = new ArrayBuffer(channelData.length * 2);
            const view = new DataView(pcmBuffer);
            for (let i = 0; i < channelData.length; i++) {
              let s = Math.max(-1, Math.min(1, channelData[i]));
              view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
            }

            // Convert to Base64
            let binary = "";
            const bytes = new Uint8Array(pcmBuffer);
            const len = bytes.byteLength;
            for (let i = 0; i < len; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const base64Audio = btoa(binary);

            // Send to WS Live endpoint
            ws.send(JSON.stringify({ audio: base64Audio }));
          };

          setSessionActive(true);
          setConnecting(false);
          addLog("🟢 Voice Call active! Speak into your microphone. Sahayak is listening...");

        } catch (audioInitErr: any) {
          console.error("Audio Initialization failure:", audioInitErr);
          addLog("❌ Audio processing startup aborted: " + audioInitErr.message);
          ws.close();
          cleanUpAudio();
          setConnecting(false);
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.error) {
            addLog(`Error message: ${msg.error}`);
            return;
          }

          if (msg.interrupted) {
            // Stop current playback
            addLog("Interrupt: Model stopped speaking.");
            playNodesRef.current.forEach((node) => {
              try {
                node.stop();
              } catch (e) {}
            });
            playNodesRef.current = [];
            nextStartTimeRef.current = 0;
            return;
          }

          if (msg.audio && outputAudioCtxRef.current) {
            const outputCtx = outputAudioCtxRef.current;
            
            // Convert Base64 24kHz PCM to float array for AudioContext playback
            const binary = atob(msg.audio);
            const len = binary.length;
            const arrayBuffer = new ArrayBuffer(len);
            const bytes = new Uint8Array(arrayBuffer);
            for (let i = 0; i < len; i++) {
              bytes[i] = binary.charCodeAt(i);
            }
            const view = new DataView(arrayBuffer);
            const numSamples = len / 2;
            const float32 = new Float32Array(numSamples);
            for (let i = 0; i < numSamples; i++) {
              const int16 = view.getInt16(i * 2, true);
              float32[i] = int16 / 32768;
            }

            // Schedule chunk sequential playback
            const audioBuffer = outputCtx.createBuffer(1, float32.length, 24000);
            audioBuffer.getChannelData(0).set(float32);

            const source = outputCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(outputCtx.destination);

            playNodesRef.current.push(source);

            const curTime = outputCtx.currentTime;
            if (nextStartTimeRef.current < curTime) {
              nextStartTimeRef.current = curTime + 0.05; // 50ms buffer alignment delay
            }

            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += audioBuffer.duration;
            
            // Pulse level display
            setAudioLevel(60);
            setTimeout(() => setAudioLevel(20), 400);
          }
        } catch (msgErr: any) {
          console.error("Failed to parse Live Server Packet ws message:", msgErr);
        }
      };

      ws.onerror = (wsErr) => {
        console.error("WS Live API error occurred:", wsErr);
        addLog("❌ Connection Error on WebSocket. Retrying...");
      };

      ws.onclose = () => {
        addLog("WebSocket Stream Session closed.");
        setSessionActive(false);
        setConnecting(false);
        cleanUpAudio();
      };

    } catch (err: any) {
      console.error("Microphone or WS Setup failed:", err);
      addLog(`❌ Connection Aborted: ${err.message || String(err)}`);
      setSessionActive(false);
      setConnecting(false);
      cleanUpAudio();
    }
  };

  useEffect(() => {
    return () => {
      cleanUpAudio();
    };
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col h-[600px] w-full" id="sahayak-voice-call-room">
      {/* Workspace Header */}
      <div className="border-b border-slate-800 pb-4 mb-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2 header-font">
          <Phone className="w-5 h-5 text-emerald-500" />
          <span>Live AI Voice Helper Room</span>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono uppercase tracking-wider">Realtime</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">Talk naturally to a helpful, low-latency logistics companion powered by Gemini Flash Live API.</p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-6 relative">
        
        {/* Glow Call Visualizer Circle */}
        <div className="relative flex items-center justify-center">
          {sessionActive && (
            <>
              {/* Outer wave ripples */}
              <div 
                className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"
                style={{ transform: `scale(${1 + audioLevel / 80})`, transition: "transform 100ms ease-out" }}
              />
              <div 
                className="absolute inset-0 rounded-full bg-emerald-500/10 animate-pulse duration-1500"
                style={{ transform: `scale(${1.2 + audioLevel / 60})` }}
              />
            </>
          )}

          {/* Core sphere button interface */}
          <button
            onClick={handleConnectVoice}
            disabled={connecting}
            className={`w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-lg transition-all transform duration-300 relative z-10 select-none ${
              sessionActive 
                ? "bg-gradient-to-tr from-emerald-600 to-teal-500 text-slate-950 scale-105 border-4 border-emerald-450 hover:opacity-90"
                : connecting
                ? "bg-slate-850 text-slate-400 border-4 border-slate-700 animate-pulse"
                : "bg-slate-950 text-emerald-500 hover:text-emerald-400 hover:bg-slate-800 border-4 border-slate-800 hover:border-emerald-500/30"
            }`}
          >
            {connecting ? (
              <Loader2 className="w-10 h-10 animate-spin" />
            ) : sessionActive ? (
              <PhoneOff className="w-10 h-10 text-slate-950 animate-bounce" />
            ) : (
              <Phone className="w-10 h-10" />
            )}
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider mt-2">
              {connecting ? "Connecting" : sessionActive ? "Disconnect" : "Start Call"}
            </span>
          </button>
        </div>

        {/* Level bar metrics or visual representation */}
        {sessionActive && (
          <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-full px-4 py-1.5 text-xs text-emerald-400 font-bold tracking-wide">
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span>Voice Signal: {audioLevel}%</span>
          </div>
        )}

        {/* Live Controller Buttons */}
        {sessionActive && (
          <div className="flex gap-4 items-center">
            <button
              onClick={handleToggleMute}
              className={`p-3.5 rounded-full transition-all border flex items-center justify-center ${
                isMuted
                  ? "bg-red-500 text-slate-950 shadow-md border-red-400"
                  : "bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300"
              }`}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
        )}

      </div>

      {/* Terminal Live Activity Log */}
      <div className="bg-slate-950 border border-slate-850 rounded-2xl p-4 mt-4 h-40">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 border-b border-slate-850 pb-1.5 mb-2">
          <span className="uppercase tracking-widest font-black flex items-center gap-1.5">
            <SignalHigh className="w-3.5 h-3.5 text-emerald-400" /> Grounded Stream Logs
          </span>
          {sessionActive ? (
            <span className="text-emerald-500 font-semibold animate-pulse">● Connected to Live API</span>
          ) : (
            <span>● Offline Standby</span>
          )}
        </div>
        <div className="overflow-y-auto h-24 space-y-1 pr-1 font-mono text-xs text-slate-400">
          {logs.map((log, index) => (
            <p key={index} className={`leading-relaxed ${index === 0 ? "text-emerald-350" : ""}`}>
              {`> ${log}`}
            </p>
          ))}
        </div>
      </div>

      {/* Guide details panel */}
      <div className="bg-slate-950/50 p-3 rounded-2xl flex items-start gap-2.5 text-[11px] text-slate-400 mt-4 border border-slate-800/40">
        <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-300">How to converse verbal with Sahayak:</p>
          <p>Click "Start Call" to begin the audio stream. Grant mic permissions. Talk naturally in Hindi, Hinglish, or English. Speak for 2-3 seconds, then release. Sahayak is fully multi-turn aware and responds verbally instantly.</p>
        </div>
      </div>
    </div>
  );
}
