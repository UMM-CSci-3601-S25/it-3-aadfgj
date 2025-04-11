import { TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeComponent } from './landing-page';
import { By } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

describe('HomeComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule,
        MatToolbarModule,
        MatIconModule,
        MatSidenavModule,
        MatCardModule,
        MatListModule,
        HttpClientModule,
        FormsModule,
        HomeComponent
      ],
    }).compileComponents();
  }));

  it('should create landing page', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should call createGame when Create New Game button is clicked', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;
    spyOn(component, 'createGame');
    const createButton = fixture.debugElement.query(By.css('button#create-game'));
    createButton.triggerEventHandler('click', null);
    expect(component.createGame).toHaveBeenCalled();
  });

  it('should have a Join Game button', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges();
    const joinButton = fixture.debugElement.query(By.css('button#join-game'));
    expect(joinButton).toBeTruthy();
  });

  it('should call createGame and navigate to the settings page with the new game ID', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;
    const httpClient = TestBed.inject(HttpClient);
    const router = TestBed.inject(Router);

    spyOn(httpClient, 'post').and.returnValue({
      pipe: () => ({
        subscribe: (callbacks: { next: (newId: string) => void }) => {
          callbacks.next('12345'); // Simulate API response with a new game ID
        },
      }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    spyOn(router, 'navigateByUrl');

    component.createGame();

    expect(httpClient.post).toHaveBeenCalledWith('/api/game/new', jasmine.objectContaining({
      players: [],
      judge: 0,
      winnerBecomesJudge: false,
      responses: [],
      scores: [],
      pastResponses: []
    }));
    expect(router.navigateByUrl).toHaveBeenCalledWith('/settings/12345');
  });
});
