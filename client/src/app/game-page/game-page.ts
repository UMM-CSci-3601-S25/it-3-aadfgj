import { Component, signal, WritableSignal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
//import { toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Game } from '../game';
import { catchError, map, switchMap } from 'rxjs/operators';
//import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Import CommonModule
//import { console } from 'inspector';


@Component({
  selector: 'app-game-page',
  templateUrl: 'game-page.html',
  styleUrls: ['./game-page.scss'],
  providers: [],
  imports: [
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatCheckboxModule,
    CommonModule // Add CommonModule to imports
  ]
})
export class GameComponent {
  prompt: string = ''; // Initialize the prompt property
  game: WritableSignal<Game | null> = signal(null); // Use WritableSignal and initialize with null
  error = signal({help: '', httpResponse: '', message: ''});

  private socket: WebSocket;

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient
  ) {
    this.socket = new WebSocket('ws://localhost:4567/api/game/updates');
    this.socket.onmessage = (event) => {
      console.log('WebSocket message received:', event.data);
      this.refreshGame(); // Refresh game data on update
    };

    // Initialize the game signal with data from the server
    this.route.paramMap.pipe(
      map((paramMap: ParamMap) => paramMap.get('id')),
      switchMap((id: string) => this.httpClient.get<Game>(`/api/game/${id}`)),
      catchError((_err) => {
        this.error.set({
          help: 'There was a problem loading the game – try again.',
          httpResponse: _err.message,
          message: _err.error?.title,
        });
        return of(null);
      })
    ).subscribe((game) => this.game.set(game)); // Update the signal with the fetched game
  }

  refreshGame() {
    const gameId = this.game()?.['_id'];
    if (gameId) {
      this.httpClient.get<Game>(`/api/game/${gameId}`).subscribe((updatedGame) => {
        this.game.set(updatedGame); // Update the game state
      });
    }
  }

  submitPrompt() {
    const gameId = this.game()?._id;
    this.httpClient.put<Game>(`/api/game/edit/${gameId}`, {$set:{prompt: this.submission}}).subscribe();
    //console.log(this.submission);
    //this.isPromptSubmitted = true; // Mark the prompt as submitted
    this.displayedPrompt = this.submission; // Store the submitted prompt
    this.submission = ''; // Clear the input field
  }

  submitResponse() {
    const gameId = this.game()?._id;
    const responses = this.game()?.responses || []; // Ensure responses is defined
    responses[this.playerId] = this.response; // Add the new response to the array

    // Ensure the judge's response is treated as the prompt
    if (this.playerId === this.game()?.judge) {
      this.displayedPrompt = this.response; // Store the judge's response as the prompt
    }

    this.httpClient.put<Game>(`/api/game/edit/${gameId}`, { $set: { responses: responses } }).subscribe();
    this.response = ''; // Clear the input field
    this.shuffleArray();
  }
  submission = "";
  response = ""
  username = " ";
  usernameInput: string = "";
  numPlayers: number = 0;
  //isPromptSubmitted: boolean = false;
  displayedPrompt: string = '';
  responses: string[] = []; // Initialize responses as an empty array

  submitUsername() {
    if (this.usernameInput.trim()) { //  && this.playerId == null
      this.playerId = this.game().players.length;
      this.username = this.usernameInput.trim(); // Update the displayed username
      const gameId = this.game()?._id;
      const scores = this.game()?.scores;
      scores.push(0);
      const responses = this.game()?.responses;
      responses.push("");
      const players = this.game()?.players;
      players.push(this.username);

      // Set the first player as the judge
      let judge = this.game()?.judge;
      if (this.playerId === 0) {
        judge = 0;
      }

      this.httpClient.put<Game>(`/api/game/edit/${gameId}`, {
        $set: { players: players, scores: scores, responses: responses, judge: judge }
      }).subscribe();

      this.numPlayers = this.players.length; // Update the number of players
      //console.log(this.players); // players name
      //console.log(this.numPlayers); // number of players
      //console.log(this.game()); // game object
    }
  }

  playerId: number;
  players: string[] = []; // Array to store player names with scores
  newPlayer: string = ""; // Input for new player name
  playerPerm: number[] = [];

  getResponses() {
    const array: string[] = [];
    for (let i = 0; i < this.playerPerm.length; i++) {
      array.push(this.game()?.responses[this.playerPerm[i]]);
    }
    return array;
  }

  shuffleArray() {
    this.playerPerm = [];
    for (let i = 0; i < this.game()?.players.length; i++) {
      if (i != this.game()?.judge)
        this.playerPerm.push(i);
    }
    for (let i = this.playerPerm.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.playerPerm[i], this.playerPerm[j]] = [this.playerPerm[j], this.playerPerm[i]];
    }
  }

  selectResponse(i) {
    const gameId = this.game()?._id;
    const scores = this.game()?.scores;
    const pastResponses = this.game()?.pastResponses || [];
    scores[this.playerPerm[i]]++;

    // Append all responses to pastResponses
    for (let j = 0; j < this.game()?.responses.length; j++) {
      pastResponses[j] = this.game()?.responses[j];
    }

    // Clear the responses array for the next round
    const responses: Array<string> = [];
    for (let j = 0; j < this.game()?.responses.length; j++) {
      responses.push("");
    }

    // Reset the displayed responses array
    this.game().responses = responses;

    // Update the game state on the server
    this.httpClient.put<Game>(`/api/game/edit/${gameId}`, {
      $set: { pastResponses: pastResponses, scores: scores, responses: responses }
    }).subscribe(() => {
      const winnerBecomesJudge = this.game()?.winnerBecomesJudge;

      if (winnerBecomesJudge) {
        //console.log("Winner becomes judge");
        const newJudge = this.playerPerm[i]; // The index of the selected response becomes the new judge
        this.httpClient.put<Game>(`/api/game/edit/${gameId}`, { $set: { judge: newJudge } }).subscribe(() => {
          this.game().judge = newJudge; // Update the local game object
          //console.log(`Judge updated to player index: ${newJudge}`);
        });
      } else {
        const newJudge = (this.game()?.judge + 1) % this.game()?.players.length; // Increment judge to the next player
        this.httpClient.put<Game>(`/api/game/edit/${gameId}`, { $set: { judge: newJudge } }).subscribe(() => {
          this.game().judge = newJudge; // Update the local game object
          //console.log(`Judge updated to player index: ${newJudge}`);
        });
      }
    });
  }

  responsesReady() {
    for (let i = 0; i < this.game()?.responses.length; i++) {
      if (this.game()?.responses[i] == "") {
        return false;
      }
    }
    return true;
  }

}
