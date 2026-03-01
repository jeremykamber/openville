"use client";

import { useStream } from "@langchain/langgraph-sdk/react";
import { useState } from "react";
import { RAGWorkflowStreamer } from "@/app/components/agents/RAGWorkflowStreamer";

export default function RAGWorkflowPage() {
  const [jobDesc, setJobDesc] = useState("");
  const [userPrefs, setUserPrefs] = useState({ priority: "cost", budget: "" });

  // @ts-ignore: TypeScript falls back to base UseStreamOptions, missing deep agents
  const stream = useStream({
    assistantId: "openville-rag-agent",
    apiUrl: process.env.NEXT_PUBLIC_LANGGRAPH_API_URL || "http://localhost:2024",
    filterSubagentMessages: true,
    fetchStateHistory: true,
  }) as any;

  const startWorkflow = async () => {
    if (!jobDesc.trim()) return;

    stream.submit(
      {
        messages: [{
          content: `Please execute the OpenVille RAG workflow for the following job description: "${jobDesc}".
User Preferences: ${JSON.stringify(userPrefs)}`,
          type: "human"
        }]
      },
      { streamSubgraphs: true }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto space-y-8">

        <header className="mb-8 border-b pb-4">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            OpenVille RAG Agent
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            Describe your job, and our deepagent will search, select, and negotiate automatically.
          </p>
        </header>

        {/* Workflow Configuration Panel */}
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-2" htmlFor="jobDesc">
              Job Description
            </label>
            <textarea
              id="jobDesc"
              className="w-full border rounded-lg p-3 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
              rows={4}
              placeholder="E.g., I need a skilled plumber to fix a leaking pipe in my kitchen ASAP."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Priority</label>
              <select
                className="w-full border rounded-lg p-3 text-slate-700 bg-white"
                value={userPrefs.priority}
                onChange={(e) => setUserPrefs({ ...userPrefs, priority: e.target.value })}
              >
                <option value="cost">Cost-effective (Lowest Price)</option>
                <option value="speed">Fastest (Quickest Completion)</option>
                <option value="rating">Highest Rated (Best Quality)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Budget ($)</label>
              <input
                type="number"
                placeholder="Optional"
                className="w-full border rounded-lg p-3 text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
                value={userPrefs.budget}
                onChange={(e) => setUserPrefs({ ...userPrefs, budget: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={startWorkflow}
              disabled={stream.isLoading || !jobDesc.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {stream.isLoading ? 'Agent Running...' : 'Start RAG Workflow'}
            </button>
          </div>
        </div>

        {/* Streaming UI */}
        {(stream.messages.length > 0 || stream.activeSubagents.length > 0) && (
          <div className="mt-8">
            <RAGWorkflowStreamer stream={stream} />
          </div>
        )}
      </div>
    </div>
  );
}
