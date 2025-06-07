
export type PlayerPosition =
  | "Goalkeeper"
  | "Right Back"
  | "Left Back"
  | "Center Back"
  | "Defensive Midfielder"
  | "Attacking Midfielder"
  | "Right Winger"
  | "Left Winger"
  | "Center Forward";

export const playerPositions: PlayerPosition[] = [
  "Goalkeeper", "Right Back", "Left Back", "Center Back",
  "Defensive Midfielder", "Attacking Midfielder", "Right Winger",
  "Left Winger", "Center Forward"
];

export const playerPositionTranslations: Record<PlayerPosition, string> = {
  "Goalkeeper": "حارس المرمى",
  "Right Back": "الظهير الأيمن",
  "Left Back": "الظهير الأيسر",
  "Center Back": "المدافع المركزي",
  "Defensive Midfielder": "لاعب الوسط الدفاعي",
  "Attacking Midfielder": "لاعب الوسط الهجومي",
  "Right Winger": "الجناح الأيمن",
  "Left Winger": "الجناح الأيسر",
  "Center Forward": "المهاجم المركزي",
};

export type MatchResult = "Win" | "Draw" | "Loss";
export const matchResults: MatchResult[] = ["Win", "Draw", "Loss"];
export const matchResultTranslations: Record<MatchResult, string> = {
  "Win": "فوز",
  "Draw": "تعادل",
  "Loss": "خسارة",
};

// Goals from 0 to 20 for players, and 0-10 for match scores
export const goalOptions: number[] = Array.from({ length: 21 }, (_, i) => i);
export const matchScoreOptions: number[] = Array.from({ length: 11 }, (_, i) => i);


export interface Player {
  id: string;
  name: string;
  position: PlayerPosition;
  goals: number;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  points: number;
  goalsFor?: number;
  goalsAgainst?: number;
  goalDifference?: number; 
}

export interface Match {
  id: string;
  teamAId: string;
  teamBId: string;
  teamAResult?: MatchResult;
  // teamAScore and teamBScore were for points allocation, not actual goals
  // Let's add actual scores
  teamAScoreActual?: number; 
  teamBScoreActual?: number;
}

export interface Group {
  id: string;
  name: string;
  teams: Team[];
  matches: Match[];
}
