import { Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterLink, ActivatedRoute, ParamMap } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { catchError, map, of, switchMap } from 'rxjs';
import { Game } from '../game';
import { HttpClient } from '@angular/common/http';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-settings-page',
  templateUrl: './settings-page.html',
  styleUrls: ['./settings-page.scss'],
  standalone: true,
  imports: [
    MatCardModule,
    RouterLink,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatIconModule,
    MatTooltipModule
  ]
})
export class SettingsPageComponent {
  judgeOption = signal<boolean | undefined>(false);
  private judgeOption$ = toObservable(this.judgeOption);
  showCopyFeedback = signal(false);
  winningScore = signal<number | undefined>(1); // Default winning score

  game = toSignal(
    this.route.paramMap.pipe(
      map((paramMap: ParamMap) => paramMap.get('id')),
      switchMap((id: string) => this.httpClient.get<Game>(`/api/game/${id}`)),
      catchError((_err) => {
        this.error.set({
          help: 'There was problem loading the game - try again.',
          httpResponse: _err.message,
          message: _err.error?.title,
        });
        return of();
      })
    )
  );

  error = signal({ help: '', httpResponse: '', message: '' });

  constructor(
    private route: ActivatedRoute,
    private httpClient: HttpClient
  ) {}

  copyGameCode() {
    const gameId = this.game()?._id;
    if (gameId) {
      navigator.clipboard.writeText(gameId)
        .then(() => {
          this.showCopyFeedback.set(true);
          setTimeout(() => this.showCopyFeedback.set(false), 2000);
        })
        .catch(() => {
          const textarea = document.createElement('textarea');
          textarea.value = gameId;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
          this.showCopyFeedback.set(true);
          setTimeout(() => this.showCopyFeedback.set(false), 2000);
        });
    }
  }

  updateGameSettings() {
    const gameId = this.game()?._id;
    if (gameId) {
      this.httpClient.put<Game>(
        `/api/game/edit/${gameId}`,
        { $set: { winnerBecomesJudge: this.judgeOption(), winningScore: this.winningScore() } }
      ).subscribe();
    }
  }
}
