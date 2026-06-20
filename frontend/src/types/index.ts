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
