"use client";

import { useState, useEffect } from "react";
import type { SubagentStream } from "@langchain/langgraph-sdk/react";
import type { Message } from "@langchain/langgraph-sdk";

export function RAGWorkflowStreamer({ stream }: { stream: any }) {

  // Calculate completed subagents for progress tracking
  const subagentsArray = Array.from(stream.subagents?.values() || []) as SubagentStream[];
  const completed = subagentsArray.filter(
    (s: SubagentStream) => s.status === "complete" || s.status === "error"
  ).length;
  const allDone = subagentsArray.length > 0 && completed === subagentsArray.length;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 p-6 lg:p-8 animate-in fade-in duration-1000">

      {/* Modern Progress Dashboard */}
      {subagentsArray.length > 0 && (
        <div className="relative group overflow-hidden bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                <div className="flex -space-x-1">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-slate-300 rounded-full"></div>
                </div>
                Execution Engine
              </h2>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Process Monitoring Protocol</p>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-2 px-4 rounded-xl border border-slate-100">
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase text-slate-400 tracking-widest leading-none">Global Completion</div>
                <div className="text-lg font-bold text-slate-800">{Math.round((completed / Math.max(1, subagentsArray.length)) * 100)}%</div>
              </div>
            </div>
          </div>

          <div className="relative h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200 mb-8">
            <div
              className="h-full bg-blue-600 transition-all duration-1000 ease-out"
              style={{ width: `${(completed / Math.max(1, subagentsArray.length)) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subagentsArray.map((subagent: SubagentStream) => (
              <SubagentCard key={subagent.id} subagent={subagent} />
            ))}
          </div>
        </div>
      )}

      {/* Refined Main Agent Protocol */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <span className="text-sm">⌬</span>
            </div>
            Main Control Thread
          </h3>
          {stream.isLoading && (
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-600 rounded-lg border border-slate-200 text-[10px] font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
              Processing
            </div>
          )}
        </div>

        {stream.messages.length === 0 && !stream.isLoading && (
          <div className="flex flex-col items-center justify-center py-20 px-8 bg-white rounded-3xl border border-slate-200 text-slate-400">
            <div className="font-bold text-lg mb-1 text-slate-300">Awaiting Signal</div>
            <div className="text-sm">Ready to execute RAG workflow protocols.</div>
          </div>
        )}

        <div className="relative space-y-8 pl-0">
          {stream.messages.map((message: Message, idx: number) => {
            const isToolCall = message.type === 'ai' && message.tool_calls && message.tool_calls.length > 0;
            const isToolResult = message.type === 'tool';
            const isHuman = message.type === 'human';
            const isAI = message.type === 'ai';

            let thinkingContent = "";
            let mainContent = getStreamingContent([message]);

            const reasoning = (message as any).reasoning_content ||
              message.additional_kwargs?.reasoning ||
              message.additional_kwargs?.reasoning_content;

            if (reasoning) {
              thinkingContent = String(reasoning);
            } else if (mainContent.includes("<think>")) {
              const thinkMatch = mainContent.match(/<think>([\s\S]*?)<\/think>/);
              if (thinkMatch) {
                thinkingContent = thinkMatch[1].trim();
                mainContent = mainContent.replace(/<think>[\s\S]*?<\/think>/, "").trim();
              }
            }

            return (
              <div
                key={message.id ?? idx}
                className={`relative flex flex-col ${isHuman ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`relative w-full md:max-w-[90%] p-6 rounded-2xl border transition-all duration-300 ${isHuman ? 'bg-slate-50 border-slate-200' :
                    isAI ? 'bg-white border-slate-200 shadow-sm' :
                      'bg-slate-50/50 border-slate-200'
                    }`}
                >
                  <div className={`absolute -top-2.5 ${isHuman ? 'right-6' : 'left-6'} px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-widest ${isHuman ? 'bg-slate-900 text-white border-slate-900' :
                    isAI ? 'bg-white text-slate-900 border-slate-200' :
                      'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                    {isHuman ? 'Operator' : isAI ? 'Agent' : 'System'}
                  </div>

                  {thinkingContent && (
                    <div className="mb-4 mt-2 p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-[13px] leading-relaxed italic">
                      <div className="font-bold text-[9px] text-slate-400 mb-2 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-4 h-[1px] bg-slate-200"></span>
                        Thinking
                      </div>
                      <div className="whitespace-pre-wrap">{thinkingContent}</div>
                    </div>
                  )}

                  <div className={`text-slate-700 leading-relaxed`}>
                    {mainContent && !isToolResult && (
                      <div className={`text-base font-medium ${isHuman ? 'text-slate-900' : 'text-slate-800'}`}>
                        {cleanContent(mainContent)}
                      </div>
                    )}

                    {isToolCall && message.tool_calls && message.tool_calls.map((tc: any, i: number) => (
                      <CollapsibleData
                        key={i}
                        title={tc.name}
                        data={tc.args}
                        type="call"
                      />
                    ))}

                    {isToolResult && (
                      <CollapsibleData
                        title={(message as any).name || "Result"}
                        data={message.content}
                        type="result"
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CollapsibleData({ title, data, type }: { title: string, data: any, type: 'call' | 'result' }) {
  const [isExpanded, setIsExpanded] = useState(false);

  let formattedData = "";
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    formattedData = JSON.stringify(parsed, null, 2);
  } catch {
    formattedData = String(data);
  }

  const isLong = formattedData.length > 200;

  return (
    <div className={`mt-3 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden`}>
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${type === 'call' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'
            }`}>
            {type === 'call' ? 'λ' : '✓'}
          </div>
          <div className="text-xs font-bold text-slate-800 uppercase tracking-tight">{title}</div>
        </div>
        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
          {isExpanded ? 'Hide' : 'Inspect'}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 pt-0 border-t border-slate-100 flex flex-col gap-2">
          <div className="flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(formattedData);
              }}
              className="text-[9px] font-bold text-slate-400 uppercase hover:text-slate-600 px-2 py-1"
            >
              Copy JSON
            </button>
          </div>
          <pre className="text-[11px] leading-relaxed font-mono p-4 bg-slate-50 text-slate-600 rounded-lg overflow-x-auto max-h-[500px]">
            {formattedData}
          </pre>
        </div>
      )}
    </div>
  );
}

function SubagentCard({ subagent }: { subagent: SubagentStream }) {
  const content = cleanContent(getStreamingContent(subagent.messages));

  return (
    <div className={`bg-white border rounded-2xl p-6 transition-all duration-300 ${subagent.status === "error" ? "border-red-200" :
      subagent.status === "complete" ? "border-slate-200" :
        "border-blue-100 shadow-sm"
      }`}>
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${subagent.status === 'running' ? 'bg-blue-600 text-white shadow-sm' :
          subagent.status === 'complete' ? 'bg-slate-100 text-slate-600' :
            subagent.status === 'error' ? 'bg-red-50 text-red-600' : 'bg-slate-50'
          }`}>
          <StatusIcon status={subagent.status} />
        </div>
        <div>
          <div className="font-bold text-slate-900 text-sm tracking-tight leading-none mb-1">
            {subagent.toolCall?.args?.subagent_type || "Task"}
          </div>
          <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
            ID: {subagent.id.slice(0, 8)}
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-5 min-h-[50px] flex items-center">
        <p className="text-[11px] font-medium text-slate-500 italic leading-relaxed line-clamp-2">
          {subagent.toolCall?.args?.description || "Initializing..."}
        </p>
      </div>

      {content && (
        <div className="text-[12px] leading-relaxed text-slate-600 bg-white p-3 rounded-lg border border-slate-100 max-h-48 overflow-y-auto mb-4 font-medium italic">
          {content}
        </div>
      )}

      {/* Render Tool Interactions within the subagent flow */}
      <div className="space-y-3 mb-4">
        {subagent.messages.map((message: Message, idx: number) => {
          const isToolCall = message.type === 'ai' && message.tool_calls && message.tool_calls.length > 0;
          const isToolResult = message.type === 'tool';

          if (isToolCall) {
            return message.tool_calls?.map((tc: any, i: number) => (
              <CollapsibleData
                key={`${idx}-${i}`}
                title={tc.name}
                data={tc.args}
                type="call"
              />
            ));
          }

          if (isToolResult) {
            return (
              <CollapsibleData
                key={idx}
                title={(message as any).name || "Result"}
                data={message.content}
                type="result"
              />
            );
          }

          return null;
        })}
      </div>

      {subagent.status === "complete" && subagent.result && (
        <div className="pt-4 border-t border-slate-100">
          <CollapsibleData
            title="Final Transaction Log"
            data={subagent.result}
            type="result"
          />
        </div>
      )}

      {subagent.status === "error" && !!subagent.error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-[10px] text-red-700">
          <div className="font-bold uppercase mb-1">Error Critical</div>
          <div className="font-mono break-all opacity-80">{String(subagent.error)}</div>
        </div>
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "pending": return <span className="text-sm">⏲️</span>;
    case "running": return <span className="text-sm animate-spin block">⌬</span>;
    case "complete": return <span className="text-sm font-bold">✓</span>;
    case "error": return <span className="text-sm">⚠️</span>;
    default: return null;
  }
}

function cleanContent(text: string): string {
  if (!text) return "";

  // If the entire text is valid JSON, hide it completely
  const trimmed = text.trim();
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed);
      return "";
    } catch (e) { }
  }

  // Remove JSON blocks from mixed text
  // We use a non-greedy approach for matching { } blocks and verify they are JSON
  return text.replace(/\{[\s\S]*?\}/g, (match) => {
    try {
      JSON.parse(match);
      return ""; // Strip valid JSON
    } catch (e) {
      return match; // Keep invalid or partial blocks
    }
  }).trim();
}

function getStreamingContent(messages: Message[]): string {
  if (!messages || !Array.isArray(messages)) return "";

  return messages
    .map((m) => {
      if (typeof m.content === "string") return m.content;
      if (Array.isArray(m.content)) {
        return m.content
          .filter((c: any) => c.type === "text" && "text" in c)
          .map((c: any) => c.text)
          .join("");
      }
      return "";
    })
    .join("\n");
}
