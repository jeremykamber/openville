"use client";

import { AlertCircle, ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FollowUpPrompt } from "@/features/chat/components/FollowUpPrompt";
import { MessageList } from "@/features/chat/components/MessageList";
import { RequestComposer } from "@/features/chat/components/RequestComposer";
import { useChatFlow } from "@/features/chat/hooks/useChatFlow";
import { CandidateResults } from "@/features/search/components/CandidateResults";

export function OpenvilleWorkspace() {
  const {
    messages,
    input,
    setInput,
    submitRequest,
    preferences,
    followUpQuestion,
    chatError,
    isSubmitting,
    results,
  } = useChatFlow();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(180,227,242,0.35),_transparent_36%),linear-gradient(180deg,_#f8fafc_0%,_#eef6f7_45%,_#f8fafc_100%)]">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="overflow-hidden border-border/70 bg-background/90 shadow-lg shadow-slate-200/60">
            <CardHeader className="gap-4 border-b border-border/70 bg-background/80">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">Dev 1 frontend slice</Badge>
                <Badge variant="secondary">Contract-first</Badge>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-3xl tracking-tight text-balance">
                  Build the first Openville flow without coupling the UI to fake data.
                </CardTitle>
                <CardDescription className="max-w-2xl text-base leading-7">
                  This screen runs through request intake, context gathering, and ranked
                  candidates while keeping the swap boundary at the repository layer.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-4 rounded-2xl bg-muted/40 p-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Trigger</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    User describes the job to be done.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Interaction</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Assistant infers preferences and ranks likely matches.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Outcome</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    UI renders stable contracts that backend can replace later.
                  </p>
                </div>
              </div>
              <RequestComposer
                value={input}
                onChange={setInput}
                onSubmit={submitRequest}
                disabled={isSubmitting}
              />
              {chatError ? (
                <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <p>{chatError}</p>
                </div>
              ) : null}
              <MessageList messages={messages} />
              <FollowUpPrompt
                followUpQuestion={followUpQuestion}
                preferences={preferences}
              />
            </CardContent>
          </Card>
          <Card className="border-border/70 bg-slate-950 text-slate-50 shadow-lg shadow-slate-300/40">
            <CardHeader className="gap-3 border-b border-white/10">
              <Badge className="bg-white text-slate-950 hover:bg-white">Why this matters</Badge>
              <CardTitle className="text-2xl">
                The refactor-safe boundary is the main engineering win.
              </CardTitle>
              <CardDescription className="text-slate-300">
                The mock repository is asynchronous on purpose, so your loading, error, and
                empty states are real now and don&apos;t need to be invented later.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 text-sm leading-7 text-slate-200">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <ArrowRight className="mt-1 size-4 shrink-0 text-sky-300" />
                <p>
                  Canonical type names stay stable: <strong>Candidate</strong>,
                  <strong> UserPreferences</strong>, <strong>ChatMessage</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <ArrowRight className="mt-1 size-4 shrink-0 text-sky-300" />
                <p>
                  Mock-ness lives in fixtures and repositories, not in the interface names.
                </p>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <ArrowRight className="mt-1 size-4 shrink-0 text-sky-300" />
                <p>
                  When backend lands, you should swap repository implementations or add a small
                  adapter instead of rewriting presentational components.
                </p>
              </div>
              <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-4 font-mono text-xs leading-6 text-slate-300">
                UI -&gt; feature hook -&gt; repository interface -&gt; mock now / backend later
              </div>
            </CardContent>
          </Card>
        </section>
        <section>
          <CandidateResults
            status={results.status}
            data={results.data}
            error={results.error}
            onRetry={results.retry}
          />
        </section>
      </main>
    </div>
  );
}
