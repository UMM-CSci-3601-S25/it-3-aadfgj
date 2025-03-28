import { Component, signal } from '@angular/core';
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
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common'; // Import CommonModule


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
  game = toSignal(
    this.route.paramMap.pipe(
      // Map the paramMap into the id
      map((paramMap: ParamMap) => paramMap.get('id')),
      switchMap((id: string) => this.httpClient.get<Game>(`/api/game/${id}`)),
      catchError((_err) => {
        this.error.set({
          help: 'There was a problem loading the game – try again.',
          httpResponse: _err.message,
          message: _err.error?.title,
        });
        return of();
      })

    ));
  error = signal({help: '', httpResponse: '', message: ''});
  submit() {
    const gameId = this.route.snapshot.paramMap.get('id');
    this.httpClient.put<Game>(`/api/game/edit/${gameId}`, {$set:{prompt: this.submission}}).subscribe();
  }

  submission = "";
  username = " ";
  usernameInput: string = ""; // Input for username

  submitUsername() {
    if (this.usernameInput.trim()) {
      this.username = this.usernameInput.trim(); // Update the displayed username
      this.players.push(this.username); // Add the username to the players array
    }
  }

  players: string[] = []; // Array to store player names with scores
  newPlayer: string = ""; // Input for new player name
  playerScores: { [key: string]: number } = {}; // Track scores for each player

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient
  ) {}
}
