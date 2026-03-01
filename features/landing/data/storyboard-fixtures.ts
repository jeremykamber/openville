export type MarketCluster =
  | "av_systems"
  | "staffing_ops"
  | "logistics"
  | "venue_ops"
  | "backup_support";

export type SurvivalStage = "market" | "top10" | "top3" | "winner";

export interface StoryScenario {
  eventName: string;
  eventDateLabel: string;
  deadlineLabel: string;
  locationLabel: string;
  budgetStance: string;
  request: string;
  assistantResponse: string;
}

export interface StoryPriority {
  label: string;
  value: string;
}

export interface PastFragment {
  id: string;
  title: string;
  detail: string;
  type: "quote" | "call" | "schedule" | "staffing" | "ops";
}

export interface ClusterMeta {
  id: MarketCluster;
  label: string;
  shortLabel: string;
  count: number;
  description: string;
}

export interface MarketAgent {
  id: string;
  name: string;
  label: string;
  cluster: MarketCluster;
  specialty: string;
  speed: string;
  reliability: number;
  baselineQuote: number;
  availabilityConfidence: number;
  negotiationFlexibility: "low" | "medium" | "high";
  survivedTo: SurvivalStage;
  eliminationReason: string | null;
}

export interface FinalistNegotiation {
  agentId: string;
  name: string;
  role: string;
  openingPrice: number;
  negotiatedPrice: number;
  scopeCoverage: "full" | "partial";
  guarantee: string;
  strength: string;
  weakness: string;
  negotiationSummary: string;
  reliability: number;
  deliveryWindow: string;
  outcome: "winner" | "scope_risk" | "cost_risk";
}

export interface LifecycleStep {
  id: string;
  label: string;
  description: string;
}

function createLabel(name: string) {
  return name
    .split(" ")
    .filter((part) => part.length > 2)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function createMarketAgent(
  name: string,
  cluster: MarketCluster,
  specialty: string,
  speed: string,
  reliability: number,
  baselineQuote: number,
  availabilityConfidence: number,
  negotiationFlexibility: "low" | "medium" | "high",
  survivedTo: SurvivalStage = "market",
  eliminationReason: string | null = null,
): MarketAgent {
  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    label: createLabel(name),
    cluster,
    specialty,
    speed,
    reliability,
    baselineQuote,
    availabilityConfidence,
    negotiationFlexibility,
    survivedTo,
    eliminationReason,
  };
}

export const storyScenario: StoryScenario = {
  eventName: "Northstar Launch",
  eventDateLabel: "tomorrow",
  deadlineLabel: "4:00 PM",
  locationLabel: "Mission District",
  budgetStance: "controlled, not cheapest at all costs",
  request:
    "Tomorrow's launch event is at risk. I need AV setup, on-site support, and backup staffing by 4 PM. Keep costs tight, but reliability matters more than speed.",
  assistantResponse:
    "Understood. I am prioritizing full scope coverage, deadline certainty, and the strongest reliability-to-cost trade-off. I am opening the market now.",
};

export const heroPromptChips = [
  "Need AV, floor staff, and backup coverage by 4 PM tomorrow.",
  "Find the most reliable event ops team without blowing the budget.",
  "Get launch-day AV and onsite support locked in today.",
];

export const storyPriorities: StoryPriority[] = [
  { label: "Reliability", value: "critical" },
  { label: "Budget", value: "controlled" },
  { label: "Deadline", value: "before 4 PM tomorrow" },
  { label: "Scope", value: "AV + staffing + contingency" },
];

export const pastFragments: PastFragment[] = [
  {
    id: "frag-quote",
    title: "Quote Thread",
    detail: "AV quote expires in 47 minutes. Staffing quote still pending.",
    type: "quote",
  },
  {
    id: "frag-call",
    title: "Missed Call",
    detail: "Venue rep called back while you were comparing floor staff rates.",
    type: "call",
  },
  {
    id: "frag-schedule",
    title: "Run of Show",
    detail: "Load-in starts at 1 PM. Backup crew still unconfirmed.",
    type: "schedule",
  },
  {
    id: "frag-staff",
    title: "Crew Text",
    detail: "Need two more people on-site if the keynote line grows.",
    type: "staffing",
  },
  {
    id: "frag-ops",
    title: "Budget Cap",
    detail: "Stay under $4.5K unless reliability drops below target.",
    type: "ops",
  },
];

export const marketClusters: ClusterMeta[] = [
  {
    id: "av_systems",
    label: "AV systems",
    shortLabel: "AV",
    count: 12,
    description: "Audio, playback, lighting, and streaming specialists.",
  },
  {
    id: "staffing_ops",
    label: "Staffing + floor ops",
    shortLabel: "Staff",
    count: 10,
    description: "Guest flow, on-site floor teams, and runner coverage.",
  },
  {
    id: "logistics",
    label: "Logistics",
    shortLabel: "Log",
    count: 10,
    description: "Load-in, transport, routing, and dispatch support.",
  },
  {
    id: "venue_ops",
    label: "Venue ops",
    shortLabel: "Venue",
    count: 8,
    description: "Integrated site coordination and operator command.",
  },
  {
    id: "backup_support",
    label: "Backup support",
    shortLabel: "Backup",
    count: 10,
    description: "Fallback staffing, contingency coverage, and reserves.",
  },
];

const rawMarketAgents: MarketAgent[] = [
  createMarketAgent(
    "Bluewire AV Network",
    "av_systems",
    "premium playback and show control",
    "2 hour response",
    97,
    4200,
    90,
    "medium",
    "top3",
    null,
  ),
  createMarketAgent(
    "SignalFrame Production Ops",
    "av_systems",
    "integrated lighting and screen ops",
    "3 hour response",
    94,
    3980,
    87,
    "medium",
    "top10",
    "Dropped after ranking because staffing coverage still depended on partners.",
  ),
  createMarketAgent(
    "HouseLight Crew",
    "av_systems",
    "venue lighting and stage patch",
    "4 hour response",
    91,
    3825,
    84,
    "medium",
    "top10",
    "Dropped after ranking because backup staffing certainty stayed below target.",
  ),
  createMarketAgent(
    "Soundbridge Tech",
    "av_systems",
    "audio reinforcement and playback",
    "5 hour response",
    89,
    3600,
    79,
    "high",
    "market",
    "Eliminated because coverage was audio-only and no floor support was included.",
  ),
  createMarketAgent(
    "EchoSpan AV",
    "av_systems",
    "projection and confidence monitor stack",
    "Same day",
    87,
    3550,
    81,
    "medium",
    "market",
    "Eliminated because arrival certainty did not clear the deadline threshold.",
  ),
  createMarketAgent(
    "OpticCue Systems",
    "av_systems",
    "switching and broadcast feed ops",
    "4 hour response",
    90,
    4025,
    78,
    "low",
    "market",
    "Eliminated because the revised quote stayed too high for balanced coverage.",
  ),
  createMarketAgent(
    "Mainline Projection",
    "av_systems",
    "projection mapping and screen routing",
    "Tomorrow morning",
    86,
    3490,
    73,
    "low",
    "market",
    "Eliminated because it could not confirm crew before the venue load-in.",
  ),
  createMarketAgent(
    "StageLens Audio",
    "av_systems",
    "audio package and monitor engineering",
    "3 hour response",
    88,
    3700,
    80,
    "medium",
    "market",
    "Eliminated because it required a separate staffing coordinator.",
  ),
  createMarketAgent(
    "LineCheck Relay",
    "av_systems",
    "line check and playback redundancy",
    "2 hour response",
    84,
    3330,
    75,
    "high",
    "market",
    "Eliminated because backup staffing and runner coverage were missing.",
  ),
  createMarketAgent(
    "PrismRack AV",
    "av_systems",
    "rack build and display systems",
    "4 hour response",
    85,
    3410,
    76,
    "medium",
    "market",
    "Eliminated because the response window stayed too soft for launch day.",
  ),
  createMarketAgent(
    "TrueNorth Console",
    "av_systems",
    "show calling and playback",
    "5 hour response",
    83,
    3180,
    72,
    "medium",
    "market",
    "Eliminated because the scope excluded on-site support.",
  ),
  createMarketAgent(
    "Brightstack Media Ops",
    "av_systems",
    "screen, stream, and cue ops",
    "Tomorrow morning",
    82,
    3275,
    70,
    "high",
    "market",
    "Eliminated because escalation coverage depended on availability tomorrow morning.",
  ),
  createMarketAgent(
    "StageSprint Ops",
    "staffing_ops",
    "rapid deployment floor operations",
    "90 minute response",
    92,
    5200,
    93,
    "medium",
    "top3",
    null,
  ),
  createMarketAgent(
    "FrontRow Relay",
    "staffing_ops",
    "guest flow and on-site runner team",
    "2 hour response",
    90,
    3920,
    88,
    "high",
    "top10",
    "Dropped after ranking because AV ownership still required a second vendor.",
  ),
  createMarketAgent(
    "CrowdPilot Staffing",
    "staffing_ops",
    "check-in, ushers, and guest support",
    "2 hour response",
    86,
    2980,
    82,
    "high",
    "market",
    "Eliminated because it could not cover technical production.",
  ),
  createMarketAgent(
    "FloorSignal Crew",
    "staffing_ops",
    "runner and on-floor escalation support",
    "3 hour response",
    85,
    3075,
    78,
    "high",
    "market",
    "Eliminated because backup coverage depended on a manual callback.",
  ),
  createMarketAgent(
    "Ticketline Support",
    "staffing_ops",
    "guest arrival and registration desk staffing",
    "Same day",
    84,
    2890,
    77,
    "medium",
    "market",
    "Eliminated because the service scope stopped at front-of-house.",
  ),
  createMarketAgent(
    "VelvetRope Ops",
    "staffing_ops",
    "premium guest handling and floor management",
    "3 hour response",
    88,
    3350,
    79,
    "low",
    "market",
    "Eliminated because price stayed high without full contingency coverage.",
  ),
  createMarketAgent(
    "GreenRoom Assist",
    "staffing_ops",
    "backstage support and talent runners",
    "Tomorrow morning",
    83,
    2760,
    71,
    "high",
    "market",
    "Eliminated because it could not guarantee afternoon floor coverage.",
  ),
  createMarketAgent(
    "PivotHost Services",
    "staffing_ops",
    "flex host and production assistants",
    "2 hour response",
    85,
    3010,
    76,
    "high",
    "market",
    "Eliminated because AV and venue escalation still had to be outsourced.",
  ),
  createMarketAgent(
    "Gatecall Team",
    "staffing_ops",
    "entry flow and door support",
    "4 hour response",
    80,
    2630,
    70,
    "medium",
    "market",
    "Eliminated because the role was too narrow for the launch scope.",
  ),
  createMarketAgent(
    "Sweepline Staff",
    "staffing_ops",
    "runner pool and reset crew",
    "3 hour response",
    82,
    2840,
    73,
    "high",
    "market",
    "Eliminated because reliability drifted once contingency requests were added.",
  ),
  createMarketAgent(
    "LastCall Logistics",
    "logistics",
    "load-in routing and dispatch command",
    "2 hour response",
    89,
    3880,
    86,
    "medium",
    "top10",
    "Dropped after ranking because technical execution still required separate AV control.",
  ),
  createMarketAgent(
    "RouteRunner Dispatch",
    "logistics",
    "gear movement and crew routing",
    "2 hour response",
    84,
    3120,
    79,
    "high",
    "market",
    "Eliminated because the scope focused on transport rather than integrated coverage.",
  ),
  createMarketAgent(
    "Dockside Relay",
    "logistics",
    "dock access and vendor coordination",
    "3 hour response",
    83,
    3010,
    76,
    "medium",
    "market",
    "Eliminated because on-site staffing remained a gap.",
  ),
  createMarketAgent(
    "ShiftOrbit Logistics",
    "logistics",
    "runner dispatch and load-in timing",
    "90 minute response",
    87,
    3320,
    80,
    "high",
    "market",
    "Eliminated because AV and backup staffing stayed outside the quote.",
  ),
  createMarketAgent(
    "Packout Lane",
    "logistics",
    "equipment flow and packout sequencing",
    "Tomorrow morning",
    81,
    2875,
    72,
    "low",
    "market",
    "Eliminated because the timeline fit only post-event operations.",
  ),
  createMarketAgent(
    "FreightCue Ops",
    "logistics",
    "rapid rerouting and courier coverage",
    "2 hour response",
    85,
    3200,
    77,
    "medium",
    "market",
    "Eliminated because the plan lacked venue-side execution ownership.",
  ),
  createMarketAgent(
    "RunnerNet Systems",
    "logistics",
    "courier and runner network",
    "Same day",
    82,
    2950,
    74,
    "high",
    "market",
    "Eliminated because staffing depth was too thin for a live launch.",
  ),
  createMarketAgent(
    "Cartwheel Dispatch",
    "logistics",
    "gear transport and emergency reroutes",
    "3 hour response",
    80,
    2810,
    71,
    "high",
    "market",
    "Eliminated because full scope required technical production ownership too.",
  ),
  createMarketAgent(
    "NightBefore Ops",
    "logistics",
    "preload and staging support",
    "Tonight",
    84,
    3090,
    70,
    "medium",
    "market",
    "Eliminated because next-day on-site coverage was unconfirmed.",
  ),
  createMarketAgent(
    "LoadIn Circuit",
    "logistics",
    "venue arrival sequencing and dock flow",
    "2 hour response",
    83,
    2985,
    75,
    "medium",
    "market",
    "Eliminated because contingency coverage was limited to transport only.",
  ),
  createMarketAgent(
    "RelayCrew Systems",
    "venue_ops",
    "integrated event operations command",
    "2 hour response",
    95,
    4800,
    96,
    "high",
    "winner",
    null,
  ),
  createMarketAgent(
    "VenueGrid Support",
    "venue_ops",
    "site operations and command desk",
    "3 hour response",
    91,
    4010,
    85,
    "medium",
    "top10",
    "Dropped after ranking because fallback staffing remained dependent on subcontractors.",
  ),
  createMarketAgent(
    "Switchboard Ops",
    "venue_ops",
    "venue systems and escalation routing",
    "2 hour response",
    90,
    3950,
    83,
    "medium",
    "top10",
    "Dropped after ranking because the proposal still separated AV ownership from venue command.",
  ),
  createMarketAgent(
    "SiteAnchor Coordination",
    "venue_ops",
    "site lead and facilities coordination",
    "4 hour response",
    86,
    3460,
    77,
    "medium",
    "market",
    "Eliminated because technical production still required a second crew.",
  ),
  createMarketAgent(
    "HouseMap Control",
    "venue_ops",
    "floor plan execution and room turns",
    "Tomorrow morning",
    82,
    3120,
    70,
    "low",
    "market",
    "Eliminated because the launch needed tighter day-of guarantees.",
  ),
  createMarketAgent(
    "NorthHall Systems",
    "venue_ops",
    "command desk and site troubleshooting",
    "3 hour response",
    84,
    3210,
    74,
    "medium",
    "market",
    "Eliminated because staffing depth fell short of the forecasted guest load.",
  ),
  createMarketAgent(
    "EventBeacon Ops",
    "venue_ops",
    "room readiness and incident coordination",
    "2 hour response",
    85,
    3340,
    76,
    "medium",
    "market",
    "Eliminated because backup staffing remained optional instead of confirmed.",
  ),
  createMarketAgent(
    "Floorplan Relay",
    "venue_ops",
    "site transitions and access control",
    "4 hour response",
    81,
    3050,
    71,
    "medium",
    "market",
    "Eliminated because AV support had to be sourced elsewhere.",
  ),
  createMarketAgent(
    "Contingent Loop",
    "backup_support",
    "reserve labor and fallback escalation",
    "90 minute response",
    88,
    3840,
    90,
    "high",
    "top10",
    "Dropped after ranking because primary AV ownership was too thin.",
  ),
  createMarketAgent(
    "Fallback Signal",
    "backup_support",
    "backup operators and reserve runners",
    "2 hour response",
    84,
    3015,
    80,
    "high",
    "market",
    "Eliminated because primary venue command still needed a second vendor.",
  ),
  createMarketAgent(
    "ReserveWave Network",
    "backup_support",
    "reserve staffing and extra hands",
    "2 hour response",
    83,
    2920,
    78,
    "high",
    "market",
    "Eliminated because the core AV stack remained uncovered.",
  ),
  createMarketAgent(
    "Backup Bench Ops",
    "backup_support",
    "second-shift reserve operations",
    "Same day",
    81,
    2860,
    76,
    "high",
    "market",
    "Eliminated because the quote focused on reserves instead of the full event scope.",
  ),
  createMarketAgent(
    "CoverageMesh",
    "backup_support",
    "contingency staffing network",
    "2 hour response",
    85,
    3150,
    79,
    "medium",
    "market",
    "Eliminated because AV and venue command stayed disconnected.",
  ),
  createMarketAgent(
    "Spareline Crew",
    "backup_support",
    "runner reserves and surge support",
    "3 hour response",
    80,
    2740,
    74,
    "high",
    "market",
    "Eliminated because the reliability window was too soft for a launch day save.",
  ),
  createMarketAgent(
    "SafetyNet Roster",
    "backup_support",
    "event fallback and surge staffing",
    "Tomorrow morning",
    79,
    2680,
    71,
    "medium",
    "market",
    "Eliminated because day-of confirmation lagged too close to the deadline.",
  ),
  createMarketAgent(
    "Redundancy Works",
    "backup_support",
    "backup technical ops and relief crew",
    "4 hour response",
    82,
    2815,
    73,
    "medium",
    "market",
    "Eliminated because the revised scope still excluded venue command.",
  ),
  createMarketAgent(
    "Standby Harbor",
    "backup_support",
    "overflow staffing and dispatch reserves",
    "3 hour response",
    78,
    2590,
    70,
    "high",
    "market",
    "Eliminated because it was a strong reserve layer, not a full delivery team.",
  ),
  createMarketAgent(
    "SecondShift Loop",
    "backup_support",
    "late-add staffing and contingency route",
    "2 hour response",
    80,
    2735,
    72,
    "high",
    "market",
    "Eliminated because core technical execution stayed outside the contract.",
  ),
];

const topTenNames = [
  "RelayCrew Systems",
  "Bluewire AV Network",
  "StageSprint Ops",
  "VenueGrid Support",
  "LastCall Logistics",
  "SignalFrame Production Ops",
  "FrontRow Relay",
  "Switchboard Ops",
  "Contingent Loop",
  "HouseLight Crew",
] as const;

export const marketAgents = rawMarketAgents;

export const top10Agents = topTenNames.map((name) => {
  const agent = marketAgents.find((candidate) => candidate.name === name);

  if (!agent) {
    throw new Error(`Missing top-10 market agent fixture for ${name}.`);
  }

  return agent;
});

export const finalists: FinalistNegotiation[] = [
  {
    agentId: "relaycrew-systems",
    name: "RelayCrew Systems",
    role: "Integrated event ops",
    openingPrice: 4800,
    negotiatedPrice: 4350,
    scopeCoverage: "full",
    guarantee: "Crew confirmed by 1 PM, full coverage by 4 PM",
    strength: "Full-scope coverage with the lowest execution risk.",
    weakness: "Not the cheapest opening bid.",
    negotiationSummary:
      "Accepted a tighter blended rate in exchange for a locked crew call and one consolidated command desk.",
    reliability: 96,
    deliveryWindow: "Crew confirmed by 1 PM",
    outcome: "winner",
  },
  {
    agentId: "bluewire-av-network",
    name: "Bluewire AV Network",
    role: "Premium AV lead",
    openingPrice: 4200,
    negotiatedPrice: 4050,
    scopeCoverage: "partial",
    guarantee: "AV locked, staffing routed through partner network",
    strength: "Strongest AV reputation in the market.",
    weakness: "Staffing and contingency are not fully owned.",
    negotiationSummary:
      "Cut the AV package slightly, but kept staffing and backup coverage in a partner lane.",
    reliability: 97,
    deliveryWindow: "AV lead on-site by 12:30 PM",
    outcome: "scope_risk",
  },
  {
    agentId: "stagesprint-ops",
    name: "StageSprint Ops",
    role: "Rapid deployment operations",
    openingPrice: 5200,
    negotiatedPrice: 4950,
    scopeCoverage: "full",
    guarantee: "Fastest arrival window",
    strength: "Fastest mobilization across the three finalists.",
    weakness: "Surge pricing and thinner fallback coverage.",
    negotiationSummary:
      "Held a premium for immediate mobilization, but the fallback bench stayed thinner than the event could tolerate.",
    reliability: 92,
    deliveryWindow: "First crew on-site within 90 minutes",
    outcome: "cost_risk",
  },
];

export const winnerExplanation =
  "RelayCrew Systems wins because it covers AV, on-site support, and backup staffing inside the deadline, accepts a tighter price after negotiation, and carries the lowest execution risk.";

export const loserExplanations = [
  "Bluewire AV Network lost because its AV quality was strongest, but staffing and contingency coverage still depended on subcontracting.",
  "StageSprint Ops lost because it could move fastest, but the surge premium and thinner fallback coverage created more risk than the event could tolerate.",
];

export const lifecycleSteps: LifecycleStep[] = [
  {
    id: "booking",
    label: "Booking confirmed",
    description:
      "The winning operator stack is locked and the full event scope is attached to one confirmation.",
  },
  {
    id: "notification",
    label: "Human re-enters",
    description:
      "You get the summary, the negotiated price, and the exact reason the market chose this team.",
  },
  {
    id: "review",
    label: "Feedback closes the loop",
    description:
      "After the launch, both sides rate the handoff quality so the next market gets smarter.",
  },
];
