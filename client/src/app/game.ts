export interface Game {
  _id: string;
  //prompt?: string;
  players?: string[];
  responses?: string[];
  judge?: number;
  scores?: number[];
  winnerBecomesJudge?: boolean;
  pastResponses?: string[];
  winningScore?: number;
  winner?: string; // Add a property to store the winner's name
}


