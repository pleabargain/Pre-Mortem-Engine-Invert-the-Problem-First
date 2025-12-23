
export enum Severity {
  MINOR = 'Minor Setback',
  MAJOR = 'Major Pivot Required',
  KILLER = 'Company Killer'
}

export interface PhaseItem {
  id: string;
  title: string;
  description: string;
  severity?: Severity;
  estimated_burn?: string;
  time_wasted?: string;
}

export interface FailureRoadmap {
  business_concept: string;
  doom_score: number;
  phases: {
    market_ignorance: PhaseItem[];
    financial_suicide: PhaseItem[];
    operational_hell: PhaseItem[];
  };
  the_obituary: {
    headline: string;
    tweet_text: string;
  };
}

export interface InversionGoal {
  bad_decision: string;
  strategic_rule: string;
}

export type Step = 'landing' | 'simulating' | 'roadmap' | 'autopsy' | 'inverting' | 'inversion';

export interface AppState {
  step: Step;
  isInverted: boolean;
  idea: string;
  doomLevel: number;
  failureData: FailureRoadmap | null;
  selectedIds: Set<string>;
  inversionGoals: InversionGoal[];
}
