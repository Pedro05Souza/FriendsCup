export interface PlayerRanking {
  rank: number
  playerId: string
  playerName: string
  overallRating: number
  matchesPlayed: number
  wins: number
  losses: number
  draws: number
  winRate: number
  goalsScored: number
  avgGoalsPerMatch: number
  titlesWon: number
  titlesByChampionship: Record<string, number>
  rankingScore: number
}

export interface RecordHolder {
  playerId: string
  playerName: string
  value: number
}

export interface AllTimeRecords {
  topScorer: RecordHolder | null
  mostMatchesPlayed: RecordHolder | null
  mostTitles: RecordHolder | null
  highestWinRate: { playerId: string; playerName: string; winRate: number; matchesPlayed: number } | null
  biggestWin: { playerName: string; opponentName: string; value: number; scoreline: string; championship: string; phase: string } | null
  mostGoalsInOneMatch: { playerName: string; value: number; championship: string; phase: string } | null
}

export interface Rivalry {
  player1Id: string
  player1Name: string
  player2Id: string
  player2Name: string
  matchesPlayed: number
  player1Wins: number
  player2Wins: number
  draws: number
  player1Goals: number
  player2Goals: number
  classicScore: number
}

export type FormResult = 'W' | 'D' | 'L'

export interface FormEntry {
  result: FormResult
  goalsFor: number
  goalsAgainst: number
  opponentName: string
  championship: string
  phase: string
  decidedByPenalties: boolean
}

export interface H2HMatchDetail {
  championship: string
  year: number
  phase: string
  goalsP1: number
  goalsP2: number
  result: FormResult
}

export interface ChampionshipBrief {
  id: string
  title: string
  createdAtIso: string
  isDuo: boolean
  matchCount: number
  winnerName: string | null
}

export interface Player {
  id: string
  name: string
  overrallRating: number // intentional backend typo
  attack: number
  defense: number
  intelligence: number
  mentality: number
}

export interface ListPlayersResponse {
  players: Player[]
  hasMore: boolean
}

export interface PlayerFormData {
  name: string
  attack: number
  defense: number
  intelligence: number
  mentality: number
}

export interface ChampionshipPlayer {
  id: string
  name: string
  overallRating?: number
}

export interface GroupPlayer {
  id: string
  name: string
  points: number
  goalDifference: number
}

export interface ChampionshipGroup {
  id: string
  players: GroupPlayer[]
}

export interface MatchParticipant {
  id: string
  name: string
  goals: number
  penaltyShootoutGoals?: number
}

export interface Match {
  id: string
  matchPhase: string
  participants: MatchParticipant[]
  winnerId: string | null
  winnerName: string | null
  groupId?: string
}

export interface DuoPlayer {
  id: string
  name: string
  overrallRating: number
  attack: number
  defense: number
  intelligence: number
  mentality: number
}

export interface Duo {
  player1: DuoPlayer
  player2: DuoPlayer
}

export interface Championship {
  id: string
  title: string
  createdAtIso: string
  isDuo: boolean
  championshipWinner?: { id: string; name: string }
  goldenBootWinner?: { id: string; name: string; goals: number }
  players: ChampionshipPlayer[]
  groups?: ChampionshipGroup[]
  duos?: Duo[]
  matches: Match[]
}

export interface ChampionshipWinnerEntry {
  playerId: string
  playerName: string
  championships: Array<{
    championshipName: string
    timesWon: number
  }>
}

export interface RetrospectData {
  totalGoals: number
  totalMatches: number
  totalWins: number
  totalLosses: number
  totalDraws: number
  winRate: number
  averageGoalsPerMatch: number
  furthestStageReached: string
}

export interface MatchHistoryDto {
  matchesPlayed: number
  matchesWon: number
  matchesLost: number
  matchesDrawn: number
  winRate: number
  biggestLossDifference: number
  biggestWinDifference: number
  goalsScored: number
  goalsConceded: number
}

export interface RecapGoldenBoot {
  playerId: string
  playerName: string
  goals: number
  matchesPlayed: number
  avgGoals: number
}

export interface RecapDefense {
  playerId: string
  playerName: string
  goalsConceded: number
  matchesPlayed: number
  avgGoalsConceded: number
}

export interface RecapTitles {
  playerId: string
  playerName: string
  titlesWon: Record<string, number>
}

export interface RecapRunnerUp {
  playerId: string
  playerName: string
  runnerUps: Record<string, number>
}

export interface RecapData {
  goldenBootPodium: RecapGoldenBoot[]
  defensePodium: RecapDefense[]
  titlesPodium: RecapTitles[]
  runnerUpPodium: RecapRunnerUp[]
}

// ── Player summary (GET /players/:id/summary) ──

export type CupFinish =
  | 'CHAMPION'
  | 'RUNNER_UP'
  | 'FINALIST'
  | 'THIRD'
  | 'FOURTH'
  | 'ELIMINATED'
  | 'NOT_STARTED'

export interface PlayerSummaryCup {
  championshipId: string
  title: string
  createdAtIso: string
  isDuo: boolean
  matchesPlayed: number
  goals: number
  finish: CupFinish
  /** Deepest phase reached, when finish is ELIMINATED */
  phase: string | null
  finishRank: number
  playedFinal: boolean
  wonFinal: boolean
  goldenBoot: boolean
}

export interface PlayerSummaryOpponent {
  opponentId: string
  opponentName: string
  matchesPlayed: number
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
}

export interface PlayerSummary {
  playerId: string
  playerName: string
  cupsEntered: number
  finalsPlayed: number
  finalsWon: number
  goldenBoots: number
  bestFinish: PlayerSummaryCup | null
  cups: PlayerSummaryCup[]
  opponents: PlayerSummaryOpponent[]
}

// ── Predictions (Poisson model on 1v1 results) ──

export interface PredictedSide {
  playerId: string
  playerName: string
  /** 1v1 matches behind this player's ratings; few means close to average */
  matchesInModel: number
  expectedGoals: number
  winProbability: number
}

export interface MatchPrediction {
  player: PredictedSide
  opponent: PredictedSide
  drawProbability: number
  likelyScores: { player: number; opponent: number; probability: number }[]
  /** P(player scores i, opponent scores j), i and j from 0 to 6 */
  scoreMatrix: number[][]
}

export interface PowerRating {
  playerId: string
  playerName: string
  matchesInModel: number
  attack: number
  defence: number
  strength: number
}

export interface PowerRatings {
  matchesUsed: number
  halfLifeYears: number
  ratings: PowerRating[]
}

export type CupFormat = 'KNOCKOUT' | 'GROUPS_AND_KNOCKOUT'

export interface CupSimulation {
  format: CupFormat
  simulations: number
  seed: number
  odds: {
    playerId: string
    playerName: string
    matchesInModel: number
    title: number
    final: number
    semifinal: number
    knockout: number
  }[]
}

export interface PlayedGroupRow {
  playerId: string
  playerName: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number
  qualified: boolean
}

/** One whole cup played by the simulator, match by match. */
export interface PlayedCup {
  format: CupFormat
  seed: number
  championId: string
  championName: string
  runnerUpId: string | null
  runnerUpName: string | null
  groups: { name: string; table: PlayedGroupRow[]; matches: Match[] }[]
  knockout: Match[]
}

// ── Rating history (snapshots after each cup) ──

export type RatingScale = 'LEGACY_5' | 'POINTS_100'

export interface RatingPoint {
  championshipId: string | null
  championshipTitle: string | null
  takenAtIso: string
  scale: RatingScale
  /** As originally given: 1-5 for LEGACY_5, 0-100 otherwise */
  rawOverall: number
  /** Always 0-100 (converted for LEGACY_5) */
  overall: number
  attack: number | null
  defense: number | null
  intelligence: number | null
  mentality: number | null
}

export interface RatingHistory {
  playerId: string
  playerName: string
  snapshots: RatingPoint[]
  current: { overall: number; attack: number; defense: number; intelligence: number; mentality: number }
}

export interface RatingChange {
  playerId: string
  playerName: string
  before: RatingPoint
  after: RatingPoint
  delta: number
  rawDelta: number | null
}

export interface ChampionshipRatingChanges {
  championshipId: string
  saved: boolean
  canSave: boolean
  changes: RatingChange[]
  /** Each player's rating going into the cup; null if they had none yet. Empty for duo cups. */
  enteringRatings: { playerId: string; rating: RatingPoint | null }[]
  firstRatings: { playerId: string; playerName: string; after: RatingPoint }[]
}
