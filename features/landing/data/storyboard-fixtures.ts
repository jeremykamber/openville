/* ═══════════════════════════════════════════════════════════════════════════
   Storyboard Fixtures — Real Tradespeople Marketplace Narrative
   
   These fixtures drive the 6-section landing page story. Each section
   maps to a phase of the Openville pipeline:
   
   1. Hero      → User posts a service request
   2. Problem   → Pain of finding tradespeople manually
   3. Handoff   → AI extracts preferences from natural language
   4. Funnel    → 50 agents → 10 ranked → 3 selected → negotiation → winner
   5. Finalist  → Agent-to-agent negotiation visualization
   6. Lifecycle → Booking → human notification → two-way review
   ═══════════════════════════════════════════════════════════════════════════ */

// ── Shared Types ────────────────────────────────────────────────────────────

export type ServiceCluster =
  | "electrical"
  | "plumbing"
  | "hvac"
  | "general_contractor"
  | "landscaping";

export type SurvivalStage = "market" | "top10" | "top3" | "winner";

// ── Section 1: Hero ─────────────────────────────────────────────────────────

export interface StoryScenario {
  /** The example service request shown in the hero */
  request: string;
  /** The agent's acknowledgment response */
  assistantResponse: string;
}

export const storyScenario: StoryScenario = {
  request:
    "My kitchen faucet is leaking and the garbage disposal stopped working. I need a reliable plumber who can come this week — preferably someone with good reviews. Budget around $500.",
  assistantResponse:
    "Understood. I am searching for licensed plumbers in your area with strong reviews, availability this week, and rates within your budget. Starting the market now.",
};

export const heroPromptChips = [
  "Find a licensed electrician for a panel upgrade this week.",
  "I need a plumber for a leaking kitchen faucet — budget around $500.",
  "Get me the best-rated HVAC tech for a heat pump installation.",
  "Looking for a general contractor for a bathroom remodel under $15K.",
];

// ── Section 2: Problem ("Before Openville") ─────────────────────────────────

export interface PainPoint {
  id: string;
  title: string;
  detail: string;
  type: "search" | "trust" | "pricing" | "scheduling" | "communication";
}

export const painPoints: PainPoint[] = [
  {
    id: "pain-search",
    title: "Endless searching",
    detail:
      "You open 12 browser tabs, scroll through review sites, and still cannot tell who is actually available this week.",
    type: "search",
  },
  {
    id: "pain-trust",
    title: "Who do you trust?",
    detail:
      "Five-star reviews that feel scripted. No way to verify licensing. A cousin's recommendation from three years ago.",
    type: "trust",
  },
  {
    id: "pain-pricing",
    title: "Opaque pricing",
    detail:
      "One plumber quotes $200, another quotes $800 for the same job. You have no idea what is reasonable.",
    type: "pricing",
  },
  {
    id: "pain-scheduling",
    title: "Phone tag",
    detail:
      "You leave voicemails. They text back during your meeting. By the time you reply, the slot is taken.",
    type: "scheduling",
  },
  {
    id: "pain-communication",
    title: "No single source of truth",
    detail:
      "Quotes in email. Schedules in texts. Invoices on paper. Nothing connects to anything.",
    type: "communication",
  },
];

// ── Section 3: Handoff (Preference Extraction) ──────────────────────────────

export interface ExtractedPreference {
  label: string;
  value: string;
  source: "explicit" | "inferred";
}

export const handoffPreferences: ExtractedPreference[] = [
  { label: "Service type", value: "Plumbing", source: "explicit" },
  { label: "Issue", value: "Leaking faucet + broken disposal", source: "explicit" },
  { label: "Timeline", value: "This week", source: "explicit" },
  { label: "Budget", value: "~$500", source: "explicit" },
  { label: "Priority", value: "Reliability over speed", source: "inferred" },
  { label: "Quality signal", value: "Good reviews requested", source: "explicit" },
];

// ── Section 4: Funnel (Market Visualization) ────────────────────────────────

export interface ClusterMeta {
  id: ServiceCluster;
  label: string;
  shortLabel: string;
  count: number;
  description: string;
}

export const marketClusters: ClusterMeta[] = [
  {
    id: "plumbing",
    label: "Plumbing",
    shortLabel: "Plmb",
    count: 14,
    description: "Drain, pipe, fixture, and water heater specialists.",
  },
  {
    id: "electrical",
    label: "Electrical",
    shortLabel: "Elec",
    count: 12,
    description: "Wiring, panel, lighting, and smart home pros.",
  },
  {
    id: "hvac",
    label: "HVAC",
    shortLabel: "HVAC",
    count: 10,
    description: "Heating, cooling, and air quality technicians.",
  },
  {
    id: "general_contractor",
    label: "General Contracting",
    shortLabel: "GC",
    count: 8,
    description: "Remodels, additions, and full-scope project management.",
  },
  {
    id: "landscaping",
    label: "Landscaping",
    shortLabel: "Land",
    count: 6,
    description: "Design, maintenance, and irrigation specialists.",
  },
];

export interface MarketAgent {
  id: string;
  name: string;
  label: string;
  cluster: ServiceCluster;
  specialty: string;
  responseTime: string;
  reliability: number;
  hourlyRate: number;
  rating: number;
  negotiationFlexibility: "low" | "medium" | "high";
  survivedTo: SurvivalStage;
  eliminationReason: string | null;
}

function createLabel(name: string): string {
  return name
    .split(" ")
    .filter((part) => part.length > 2)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function createAgent(
  name: string,
  cluster: ServiceCluster,
  specialty: string,
  responseTime: string,
  reliability: number,
  hourlyRate: number,
  rating: number,
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
    responseTime,
    reliability,
    hourlyRate,
    rating,
    negotiationFlexibility,
    survivedTo,
    eliminationReason,
  };
}

const rawMarketAgents: MarketAgent[] = [
  // ── Plumbing (14 agents) ──────────────────────────────────────────────
  createAgent("ClearFlow Plumbing", "plumbing", "drain cleaning and pipe repair", "< 1 hour", 96, 110, 4.8, "high", "winner", null),
  createAgent("AquaPro Services", "plumbing", "tankless water heaters", "< 2 hours", 94, 120, 4.9, "medium", "top3", null),
  createAgent("PipeLine Masters", "plumbing", "sewer line repair", "Same day", 93, 105, 4.7, "high", "top3", null),
  createAgent("FlowState Plumbing", "plumbing", "fixture installation", "< 2 hours", 91, 95, 4.6, "medium", "top10", "Dropped: limited disposal repair experience."),
  createAgent("DrainWorks Pro", "plumbing", "hydro-jetting and drain", "Same day", 90, 100, 4.5, "high", "top10", "Dropped: availability only after Thursday."),
  createAgent("TrueBlue Plumbing", "plumbing", "residential repairs", "< 3 hours", 89, 90, 4.4, "medium", "top10", "Dropped: fewer reviews than comparable candidates."),
  createAgent("WaterLine Solutions", "plumbing", "water line replacement", "2-3 hours", 88, 115, 4.5, "low", "top10", "Dropped: hourly rate exceeded budget threshold."),
  createAgent("CopperCoat Plumbing", "plumbing", "copper repiping", "Same day", 87, 130, 4.6, "low", "market", "Eliminated: specialized in repiping, not general repairs."),
  createAgent("QuickDrain Services", "plumbing", "emergency drain clearing", "< 1 hour", 85, 140, 4.3, "medium", "market", "Eliminated: premium emergency pricing exceeded budget."),
  createAgent("BluePipe Collective", "plumbing", "commercial plumbing", "Next day", 84, 125, 4.4, "medium", "market", "Eliminated: primarily commercial, limited residential availability."),
  createAgent("SteadyFlow Repairs", "plumbing", "leak detection", "2-3 hours", 83, 95, 4.2, "high", "market", "Eliminated: lower reliability score for fixture work."),
  createAgent("BasinPro Plumbing", "plumbing", "bathroom fixtures", "Same day", 82, 85, 4.1, "high", "market", "Eliminated: limited to bathroom-only work."),
  createAgent("MainValve Services", "plumbing", "main line shut-offs", "< 4 hours", 80, 100, 4.0, "medium", "market", "Eliminated: narrow specialty, not general repair."),
  createAgent("LastDrop Plumbing", "plumbing", "water heater installs", "Next day", 78, 110, 3.9, "high", "market", "Eliminated: rating below minimum threshold."),

  // ── Electrical (12 agents) ────────────────────────────────────────────
  createAgent("SparkLine Electric", "electrical", "smart home wiring", "< 2 hours", 97, 95, 4.9, "medium", "top10", "Dropped: not a plumbing match for this request."),
  createAgent("VoltEdge Electrical", "electrical", "panel upgrades", "Same day", 94, 105, 4.8, "medium", "top10", "Dropped: service type mismatch."),
  createAgent("CircuitPath Pro", "electrical", "rewiring and code compliance", "< 3 hours", 92, 100, 4.7, "high", "market", "Eliminated: wrong service category."),
  createAgent("AmpereTech", "electrical", "EV charger installation", "Same day", 90, 110, 4.6, "medium", "market", "Eliminated: EV specialist, not general electrical."),
  createAgent("WireFrame Electric", "electrical", "commercial wiring", "2-3 hours", 88, 115, 4.5, "low", "market", "Eliminated: commercial focus."),
  createAgent("BrightSwitch Co.", "electrical", "lighting design", "< 4 hours", 86, 90, 4.4, "high", "market", "Eliminated: lighting-only specialty."),
  createAgent("GridLock Electrical", "electrical", "emergency electrical", "< 1 hour", 89, 135, 4.5, "low", "market", "Eliminated: emergency premium pricing."),
  createAgent("PowerRail Systems", "electrical", "industrial electrical", "Next day", 85, 120, 4.3, "medium", "market", "Eliminated: industrial focus."),
  createAgent("OhmWell Electric", "electrical", "outlet and switch work", "Same day", 83, 80, 4.2, "high", "market", "Eliminated: limited scope of services."),
  createAgent("ConduitCrew", "electrical", "conduit and raceway", "2-3 hours", 81, 95, 4.1, "medium", "market", "Eliminated: narrow commercial specialty."),
  createAgent("JunctionBox Pro", "electrical", "junction and panel work", "< 3 hours", 80, 100, 4.0, "high", "market", "Eliminated: panel-only focus."),
  createAgent("PlugPoint Electric", "electrical", "outlet installation", "Same day", 78, 75, 3.9, "high", "market", "Eliminated: too narrow for general needs."),

  // ── HVAC (10 agents) ──────────────────────────────────────────────────
  createAgent("Precision HVAC Solutions", "hvac", "heat pump systems", "< 1 hour", 95, 105, 4.8, "medium", "top10", "Dropped: HVAC, not plumbing."),
  createAgent("AirFlow Masters", "hvac", "duct cleaning and repair", "Same day", 92, 95, 4.7, "high", "market", "Eliminated: wrong service category."),
  createAgent("ThermoCore Systems", "hvac", "furnace installation", "< 2 hours", 90, 110, 4.6, "medium", "market", "Eliminated: heating specialist."),
  createAgent("CoolBreeze HVAC", "hvac", "AC installation", "Same day", 88, 100, 4.5, "high", "market", "Eliminated: cooling-only focus."),
  createAgent("VentPro Services", "hvac", "ventilation design", "2-3 hours", 86, 90, 4.4, "medium", "market", "Eliminated: ventilation specialty."),
  createAgent("HeatWave Systems", "hvac", "boiler repair", "< 3 hours", 84, 115, 4.3, "low", "market", "Eliminated: boiler specialist."),
  createAgent("AirPure Tech", "hvac", "air quality testing", "Next day", 82, 85, 4.2, "high", "market", "Eliminated: testing only, no installation."),
  createAgent("DuctLine Pro", "hvac", "ductwork fabrication", "2-3 hours", 80, 100, 4.1, "medium", "market", "Eliminated: commercial ductwork focus."),
  createAgent("ClimateCraft HVAC", "hvac", "zone control systems", "Same day", 83, 110, 4.3, "medium", "market", "Eliminated: zone control specialty."),
  createAgent("FrostGuard Services", "hvac", "winterization", "< 4 hours", 79, 80, 4.0, "high", "market", "Eliminated: seasonal service only."),

  // ── General Contracting (8 agents) ────────────────────────────────────
  createAgent("Titan General Contractors", "general_contractor", "kitchen and bath remodel", "< 24 hours", 93, 120, 4.7, "medium", "market", "Eliminated: remodel scope, not repair."),
  createAgent("BuildRight Construction", "general_contractor", "room additions", "1-2 days", 91, 130, 4.6, "low", "market", "Eliminated: construction, not plumbing repair."),
  createAgent("FrameUp Builders", "general_contractor", "structural work", "< 24 hours", 89, 115, 4.5, "medium", "market", "Eliminated: structural specialty."),
  createAgent("CornerStone Projects", "general_contractor", "permit management", "1-2 days", 87, 125, 4.4, "low", "market", "Eliminated: large project focus."),
  createAgent("Blueprint Builders", "general_contractor", "custom builds", "2-3 days", 85, 140, 4.5, "low", "market", "Eliminated: custom build specialist."),
  createAgent("LevelLine Construction", "general_contractor", "foundation work", "1-2 days", 83, 110, 4.3, "medium", "market", "Eliminated: foundation-only scope."),
  createAgent("TrueSquare Builds", "general_contractor", "deck and patio", "< 24 hours", 81, 100, 4.2, "high", "market", "Eliminated: outdoor-only work."),
  createAgent("SolidCraft General", "general_contractor", "multi-trade coordination", "1-2 days", 80, 105, 4.1, "medium", "market", "Eliminated: project management focus."),

  // ── Landscaping (6 agents) ────────────────────────────────────────────
  createAgent("GreenThumb Landscapes", "landscaping", "drought-resistant design", "< 3 hours", 91, 65, 4.7, "high", "market", "Eliminated: landscaping, not plumbing."),
  createAgent("TerraCraft Gardens", "landscaping", "hardscaping", "Same day", 88, 75, 4.5, "medium", "market", "Eliminated: wrong service category."),
  createAgent("MossLine Maintenance", "landscaping", "lawn care", "Next day", 85, 50, 4.4, "high", "market", "Eliminated: maintenance only."),
  createAgent("RootWorks Design", "landscaping", "irrigation systems", "< 4 hours", 83, 70, 4.3, "medium", "market", "Eliminated: irrigation specialty."),
  createAgent("StonePath Outdoors", "landscaping", "paver installation", "1-2 days", 81, 80, 4.2, "low", "market", "Eliminated: paver-only focus."),
  createAgent("BloomField Services", "landscaping", "seasonal planting", "Same day", 79, 55, 4.1, "high", "market", "Eliminated: seasonal work only."),
];

export const marketAgents = rawMarketAgents;

// ── Top 10 (survived initial ranking) ───────────────────────────────────

const topTenNames = [
  "ClearFlow Plumbing",
  "AquaPro Services",
  "PipeLine Masters",
  "FlowState Plumbing",
  "DrainWorks Pro",
  "TrueBlue Plumbing",
  "WaterLine Solutions",
  "SparkLine Electric",
  "VoltEdge Electrical",
  "Precision HVAC Solutions",
] as const;

export const top10Agents = topTenNames.map((name) => {
  const agent = marketAgents.find((a) => a.name === name);
  if (!agent) throw new Error(`Missing top-10 fixture for ${name}.`);
  return agent;
});

// ── Section 5: Finalist Negotiation ─────────────────────────────────────

export interface FinalistNegotiation {
  agentId: string;
  name: string;
  role: string;
  openingRate: number;
  negotiatedRate: number;
  estimatedTotal: number;
  scopeCoverage: "full" | "partial";
  guarantee: string;
  strength: string;
  weakness: string;
  negotiationSummary: string;
  reliability: number;
  availability: string;
  outcome: "winner" | "scope_risk" | "cost_risk";
}

export const finalists: FinalistNegotiation[] = [
  {
    agentId: "clearflow-plumbing",
    name: "ClearFlow Plumbing",
    role: "Full-service plumber",
    openingRate: 110,
    negotiatedRate: 95,
    estimatedTotal: 380,
    scopeCoverage: "full",
    guarantee: "Faucet and disposal fixed in one visit, same-week availability",
    strength: "Covers both issues in a single visit. Highest combined reliability + review score.",
    weakness: "Not the absolute cheapest opening rate.",
    negotiationSummary:
      "Accepted a lower blended rate in exchange for guaranteed same-week scheduling and a single-visit scope commitment.",
    reliability: 96,
    availability: "Tuesday or Wednesday this week",
    outcome: "winner",
  },
  {
    agentId: "aquapro-services",
    name: "AquaPro Services",
    role: "Tankless + fixture specialist",
    openingRate: 120,
    negotiatedRate: 110,
    estimatedTotal: 440,
    scopeCoverage: "partial",
    guarantee: "Faucet repair guaranteed, disposal may need a follow-up visit",
    strength: "Highest individual rating (4.9). Excellent faucet repair track record.",
    weakness: "Disposal repair may require a second trip, pushing total cost up.",
    negotiationSummary:
      "Reduced hourly rate slightly but could not guarantee single-visit resolution for both issues.",
    reliability: 94,
    availability: "Wednesday this week",
    outcome: "scope_risk",
  },
  {
    agentId: "pipeline-masters",
    name: "PipeLine Masters",
    role: "Sewer and pipe specialist",
    openingRate: 105,
    negotiatedRate: 90,
    estimatedTotal: 360,
    scopeCoverage: "full",
    guarantee: "Both issues covered, but earliest availability is Friday",
    strength: "Lowest negotiated rate. Willing to cover full scope.",
    weakness: "Availability only at end of week — tighter timeline risk.",
    negotiationSummary:
      "Offered the most aggressive rate cut but could only confirm Friday availability.",
    reliability: 93,
    availability: "Friday this week",
    outcome: "cost_risk",
  },
];

export const winnerExplanation =
  "ClearFlow Plumbing wins because it covers both the faucet leak and the broken disposal in a single visit, within budget, with same-week availability, and carries the strongest combined reliability and review score among the three finalists.";

export const loserExplanations = [
  "AquaPro Services lost because while it has the highest individual rating, the disposal repair may require a second visit — increasing total cost and adding scheduling uncertainty.",
  "PipeLine Masters lost because while it offered the lowest rate, the earliest availability is Friday — too late given the user's preference for this-week resolution.",
];

// ── Section 6: Lifecycle ────────────────────────────────────────────────

export interface LifecycleStep {
  id: string;
  label: string;
  description: string;
}

export const lifecycleSteps: LifecycleStep[] = [
  {
    id: "booking",
    label: "Booking confirmed",
    description:
      "ClearFlow Plumbing is locked in for Tuesday. Both issues scoped, rate confirmed, arrival window set.",
  },
  {
    id: "notification",
    label: "You get the full picture",
    description:
      "You receive the summary: who was selected, why they won, what was negotiated, and when they are arriving.",
  },
  {
    id: "review",
    label: "Feedback closes the loop",
    description:
      "After the job, both you and the tradesperson rate the experience. The next search gets smarter.",
  },
];
