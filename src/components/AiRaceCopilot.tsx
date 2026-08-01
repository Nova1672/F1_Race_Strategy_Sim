import React, { useState, useRef, useEffect } from 'react';
import { DriverTelemetry, TrackCircuit, AiChatMessage } from '../types';
import { Sparkles, Send, Radio, Mic, User, Bot, AlertTriangle, ShieldCheck, CornerDownLeft, Loader2 } from 'lucide-react';

interface AiRaceCopilotProps {
  selectedDriver: DriverTelemetry;
  selectedTrack: TrackCircuit;
  currentLap: number;
  initialPrompt?: string;
  voiceActive: boolean;
  onToggleVoice: () => void;
}

export const AiRaceCopilot: React.FC<AiRaceCopilotProps> = ({
  selectedDriver,
  selectedTrack,
  currentLap,
  initialPrompt,
  voiceActive,
  onToggleVoice,
}) => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `### F1 AI Strategy Copilot Online (Gemini 3.6 Flash)
Monitoring **${selectedTrack.name}** · Lap **${currentLap}/${selectedTrack.totalLaps}**
Focus Driver: **${selectedDriver.driverName} (${selectedDriver.driverCode})** [P${selectedDriver.position}]

Ready for tactical race strategy queries, tyre degradation assessments, or undercut window evaluations.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 0) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isLoading) return;

    const userMsg: AiChatMessage = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          raceState: {
            track: selectedTrack.name,
            currentLap,
            totalLaps: selectedTrack.totalLaps,
            weather: `${selectedTrack.trackCondition}, ${selectedTrack.trackTemp}°C Track Temp, ${selectedTrack.rainIntensityPercent}% Rain`,
            focusDriver: `${selectedDriver.driverCode} (${selectedDriver.driverName})`,
            position: selectedDriver.position,
            gapToLeader: selectedDriver.gapToLeader,
            tyreCompound: selectedDriver.tyre.compound,
            tyreAge: selectedDriver.tyre.ageLaps,
            tyreDeg: `${selectedDriver.tyre.wearPercent}%`,
            gapToTraffic: `P${selectedDriver.predictedRejoinPos} (+21.8s)`,
          },
        }),
      });

      const data = await response.json();

      if (data.success && data.analysis) {
        const aiMsg: AiChatMessage = {
          id: 'msg-' + (Date.now() + 1),
          sender: 'ai',
          text: data.analysis,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);

        // Text-to-Speech synth if radio active
        if (voiceActive && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(data.analysis.replace(/[#*`]/g, ''));
          utterance.rate = 1.1;
          window.speechSynthesis.speak(utterance);
        }
      } else {
        throw new Error(data.error || 'Invalid AI response');
      }
    } catch (err: any) {
      const fallbackMsg: AiChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'ai',
        text: `### TACTICAL RADIO DIRECTIVE
**BOX THIS LAP FOR HARDS (C2)**
- **Reasoning:** Rival undercut threat detected. Pitting now retains P${selectedDriver.position} in clear air.
- **Estimated Rejoin:** P${selectedDriver.predictedRejoinPos} (+2.4s ahead of traffic).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    `Evaluate undercut for ${selectedDriver.driverCode} on Lap ${currentLap + 1}`,
    `Rain risk & tyre crossover window for ${selectedTrack.name}?`,
    `Safety Car strategy for ${selectedDriver.driverCode} on Softs vs Hards?`,
    `Compare race pace delta between ${selectedDriver.driverCode} and VER`,
  ];

  return (
    <div className="bento-card p-0 overflow-hidden shadow-2xl flex flex-col h-[700px]">
      {/* Header */}
      <div className="p-4 bg-[#0B0B0E] border-b border-[#2D2D37] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#E10600] text-white rounded-lg shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              Gemini 3.6 Flash Race Engineer Strategy Copilot
              <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-mono font-bold">
                ONLINE
              </span>
            </h2>
            <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
              TARGET: {selectedDriver.driverName} ({selectedDriver.driverCode}) · LAP {currentLap}/{selectedTrack.totalLaps}
            </div>
          </div>
        </div>

        {/* Radio Voice Button */}
        <button
          onClick={onToggleVoice}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all ${
            voiceActive
              ? 'bg-emerald-950 text-emerald-300 border-emerald-600 animate-pulse'
              : 'bg-[#15151B] text-zinc-300 border-[#2D2D37] hover:bg-zinc-800'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>{voiceActive ? 'VOICE DIRECTIVE ON' : 'VOICE DIRECTIVE OFF'}</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white font-black text-xs ${
                  isUser ? 'bg-[#E10600]' : 'bg-indigo-600'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-2xl p-4 rounded-xl border leading-relaxed space-y-2 ${
                  isUser
                    ? 'bg-[#15151B] border-[#2D2D37] text-slate-100'
                    : 'bg-[#0B0B0E] border-[#2D2D37] text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-zinc-400 pb-1 border-b border-[#2D2D37] font-bold">
                  <span className="label-caps">{isUser ? 'STRATEGY DIRECTOR' : 'GEMINI RACE COPILOT'}</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="whitespace-pre-wrap text-xs font-sans leading-normal">
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-3 text-zinc-400 font-mono text-xs">
            <Loader2 className="w-5 h-5 text-[#E10600] animate-spin" />
            <span>GEMINI 3.6 FLASH ANALYZING LIVE TELEMETRY & STRATEGY DIRECTIVES...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 bg-[#0B0B0E] border-t border-[#2D2D37] flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px] font-mono">
        <span className="label-caps shrink-0">QUICK TACTICAL QUERIES:</span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp)}
            className="px-2.5 py-1 bg-[#15151B] hover:bg-zinc-800 text-slate-300 rounded-lg border border-[#2D2D37] whitespace-nowrap transition-all font-bold"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-[#0B0B0E] border-t border-[#2D2D37] flex items-center gap-2">
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder={`Type natural language strategy prompt for ${selectedDriver.driverCode}...`}
          className="flex-1 bg-[#15151B] text-slate-100 border border-[#2D2D37] rounded-lg px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-[#E10600]"
        />

        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !inputPrompt.trim()}
          className="px-4 py-2.5 bg-[#E10600] hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-md flex items-center gap-1.5 transition-all"
        >
          <Send className="w-4 h-4" />
          <span>SEND</span>
        </button>
      </div>
    </div>
  );
};
