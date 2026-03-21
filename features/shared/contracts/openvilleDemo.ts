export const OPENVILLE_LAUNCH_EVENT = "openville:launch-request";

export type MarketGraphStage =
  | "market"
  | "top10"
  | "top3"
  | "top3-pitch"
  | "negotiation"
  | "winner";

export type MarketCluster =
  | "av_systems"
  | "staffing_ops"
  | "logistics"
  | "venue_ops"
  | "backup_support";

export interface OpenvilleLaunchSeed {
  query: string;
  token: number;
  source: "hero" | "cta";
}
