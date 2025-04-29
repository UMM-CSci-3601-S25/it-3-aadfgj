import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { signal } from '@angular/core'; // Import signal for mocking Signal<Game>
import { GameComponent } from './game-page';
import { Game } from '../game'


describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;


  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserAnimationsModule,
        MatCardModule,
        HttpClientTestingModule,
        GameComponent // Import GameComponent instead of declaring it
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: () => 'test-id'
            }),
            queryParams: of({}),
            fragment: of(''),
            data: of({}),
            url: of([]),
            outlet: 'primary',
            routeConfig: {},
            parent: null,
            firstChild: null,
            children: [],
            pathFromRoot: [],
            root: null,
            snapshot: {
              paramMap: {
              }
            }
          }
        }
      ]
    })
      .compileComponents();
  }));


  beforeEach(() => {
    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    component.prompt = ''; // Initialize the prompt property
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });


  it('should initialize prompt property correctly', () => {
    expect(component.prompt).toBe('');
  });


  it('should update prompt property', () => {
    const newPrompt = 'New Test Prompt';
    component.prompt = newPrompt;
    fixture.detectChanges();
    expect(component.prompt).toBe(newPrompt);
  });


  it('should handle route parameters correctly', () => {
    const route = TestBed.inject(ActivatedRoute);
    route.paramMap.subscribe(params => {
      expect(params.get('id')).toBe('test-id');
    });
  });


  it('should update responses and handle judge response in submitResponse', () => {
    const mockGame = {
      _id: 'test-game-id',
      responses: [null, null], // Ensure responses array is initialized
      judge: 1
    };
    component.game = signal(mockGame); // Use signal to mock Signal<Game>
    component.playerId = 1;
    component.response = 'Test Response';

    const httpClientSpy = spyOn(component['httpClient'], 'put').and.callThrough();
    const shuffleArraySpy = spyOn(component, 'shuffleArray').and.callFake(() => {
      const array = mockGame.responses; // Access the array directly
      expect(array).toBeDefined(); // Ensure array is defined
      expect(array.length).toBeGreaterThan(0); // Ensure array has elements
    });

    component.submitResponse();

    expect(component.game().responses[1]).toBe('Test Response');
    expect(component.displayedPrompt).toBe('Test Response'); // Judge's response becomes the prompt
    expect(component.response).toBe(''); // Input field is cleared
    expect(httpClientSpy).toHaveBeenCalledWith(
      `/api/game/edit/test-game-id`,
      { $set: { responses: component.game().responses } }
    );
    expect(shuffleArraySpy).toHaveBeenCalled();
  });


  it('should shuffle playerPerm array correctly in shuffleArray', () => {
    const mockGame = {
      _id: 'mock-game-id', // Add the required _id property
      players: ['Player1', 'Player2', 'Player3', 'Player4'],
      judge: 0
    };
    component.game = signal(mockGame); // Mock the game object
    component.shuffleArray();

    expect(component.playerPerm).toBeDefined();
    expect(component.playerPerm.length).toBe(mockGame.players.length - 1); // Exclude the judge
    expect(component.playerPerm).not.toContain(mockGame.judge); // Ensure judge is excluded
    const uniqueValues = new Set(component.playerPerm);
    expect(uniqueValues.size).toBe(component.playerPerm.length); // Ensure no duplicates
  });

  // This test was present in the commented out code, but not in the regular code.
  // I'm not sure if you want to fix it and include it, or if you want to leave it commented out.
  // You may want to check if it impacts your coverage -- does it handle a unique case? -KK
  // it('should update scores, pastResponses, and judge correctly in selectResponse', (done) => {
  //   const mockGame = {
  //     _id: 'test-game-id',
  //     players: ['Player1', 'Player2', 'Player3'],
  //     judge: 0,
  //     scores: [0, 0, 0],
  //     responses: ['Response1', 'Response2', 'Response3'],
  //     pastResponses: [],
  //     winnerBecomesJudge: true
  //   };
  //   component.game = signal(mockGame); // Mock the game object
  //   component.playerPerm = [1, 2]; // Mock the shuffled player order

  //   const httpClientSpy = spyOn(component['httpClient'], 'put').and.callFake((url, body) => {
  //     if (body.$set.judge !== undefined) {
  //       // Simulate the judge update call
  //       component.game().judge = body.$set.judge;
  //     }
  //     return of(null); // Simulate an observable response
  //   });

  //   component.selectResponse(1); // Select the second response (index 1 in playerPerm)

  //   // Check if the score of the selected player is incremented
  //   expect(component.game().scores[2]).toBe(1);

  //   // Check if pastResponses is updated correctly
  //   expect(component.game().pastResponses).toEqual(['Response1', 'Response2', 'Response3']);

  //   // Check if responses are cleared
  //   expect(component.game().responses).toEqual(['', '', '']);

  //   // Wait for the asynchronous judge update
  //   setTimeout(() => {
  //     // Check if the judge is updated correctly
  //     expect(component.game().judge).toBe(1); // The selected response index becomes the new judge
  //     expect(httpClientSpy).toHaveBeenCalledTimes(2); // One for game state, one for judge update
  //     done(); // Mark the test as complete
  //   });
  // });


  it('should update judge to the next player in selectResponse when winnerBecomesJudge is false (opt1)', (done) => {
    const mockGame = {
      _id: 'test-game-id',
      players: ['Player1', 'Player2', 'Player3'],
      judge: 0,
      scores: [0, 0, 0],
      responses: ['Response1', 'Response2', 'Response3'],
      pastResponses: [],
      winnerBecomesJudge: false // Ensure winnerBecomesJudge is false
    };
    component.game = signal(mockGame); // Mock the game object
    component.playerPerm = [1, 2]; // Mock the shuffled player order

    const httpClientSpy = spyOn(component['httpClient'], 'put').and.callFake((url, body: { $set: { judge: number; }; }) => {
      if (body.$set.judge !== undefined) {
      // Simulate the judge update call
        component.game().judge = body.$set.judge;
      }
      return of(null); // Simulate an observable response
    });

    component.selectResponse(0); // Select the first response (index 0 in playerPerm)

    // Check if the score of the selected player is incremented
    expect(component.game().scores[1]).toBe(1);

    // Check if pastResponses is updated correctly
    expect(component.game().pastResponses).toEqual(['Response1', 'Response2', 'Response3']);

    // Check if responses are cleared
    expect(component.game().responses).toEqual(['', '', '']);

    // Wait for the asynchronous judge update
    setTimeout(() => {
    // Check if the judge is updated to the next player
      expect(component.game().judge).toBe(1); // Judge should increment to the next player
      expect(httpClientSpy).toHaveBeenCalledTimes(2); // One for game state, one for judge update
      expect(httpClientSpy).toHaveBeenCalledWith(
        `/api/game/edit/test-game-id`,
        jasmine.objectContaining({
          $set: jasmine.objectContaining({
            judge: 1 // The next player becomes the judge
          })
        })
      );
      done(); // Mark the test as complete
    });
  });

  it('should update judge to the next player in selectResponse when winnerBecomesJudge is false (opt2)', (done) => {
    const mockGame = {
      _id: 'test-game-id',
      players: ['Player1', 'Player2', 'Player3'],
      judge: 0,
      scores: [0, 0, 0],
      responses: ['Response1', 'Response2', 'Response3'],
      pastResponses: [],
      winnerBecomesJudge: false // Ensure winnerBecomesJudge is false
    };
    component.game = signal(mockGame); // Mock the game object
    component.playerPerm = [1, 2]; // Mock the shuffled player order

    const httpClientSpy = spyOn(component['httpClient'], 'put').and.callFake((url, body) => {
      if (body.$set.judge !== undefined) {
        // Simulate the judge update call
        component.game().judge = body.$set.judge;
      }
      return of(null); // Simulate an observable response
    });

    component.selectResponse(1); // Select the second response (index 1 in playerPerm)

    // Check if the score of the selected player is incremented
    expect(component.game().scores[2]).toBe(1);

    // Check if pastResponses is updated correctly
    expect(component.game().pastResponses).toEqual(['Response1', 'Response2', 'Response3']);

    // Check if responses are cleared
    expect(component.game().responses).toEqual(['', '', '']);

    // Wait for the asynchronous judge update
    setTimeout(() => {
      // Check if the judge is updated to the next player
      expect(component.game().judge).toBe(1); // Judge should increment to the next player
      expect(httpClientSpy).toHaveBeenCalledTimes(2); // One for game state, one for judge update
      expect(httpClientSpy).toHaveBeenCalledWith(
        `/api/game/edit/test-game-id`,
        jasmine.objectContaining({
          $set: jasmine.objectContaining({
            judge: 1 // The next player becomes the judge
          })
        })
      );
      done(); // Mark the test as complete
    });
  });


  it('should set judge to 0 if playerId is 0 in submitUsername', () => {
    const mockGame = {
      _id: 'test-game-id',
      players: [],
      scores: [],
      responses: [],
      judge: null
    };
    component.game = signal(mockGame); // Mock the game object
    component.usernameInput = 'Player1'; // Simulate a username input


    const httpClientSpy = spyOn(component['httpClient'], 'put').and.callFake((url: any, body: { $set: { judge: any; }; }) => {
      if (body.$set.judge !== undefined) {
        mockGame.judge = body.$set.judge; // Simulate judge update
      }
      return of(null); // Simulate an observable response
    });


    component.submitUsername(); // Call the method to test


    expect(mockGame.judge).toBe(0); // Ensure judge is set to 0
    expect(httpClientSpy).toHaveBeenCalledWith(
      `/api/game/edit/test-game-id`,
      jasmine.objectContaining({
        $set: jasmine.objectContaining({
          judge: 0 // Verify the judge is set to 0 in the HTTP request
        })
      })
    );
  });

  // I can't tell if this is different intentionally or just by chance.
  // I'm putting it back in in case it's covering a case you wanted covered. -KK
  it('should set judge to 0 if playerId is 0', () => {
    const mockGame = {
      _id: 'test-game-id',
      players: [],
      scores: [],
      responses: [],
      judge: null
    };
    component.game = signal(mockGame); // Mock the game object
    component.playerId = null; // Ensure playerId is null initially
    component.usernameInput = 'Player1'; // Simulate a username input

    const httpClientSpy = spyOn(component['httpClient'], 'put').and.callFake((url, body) => {
      if (body.$set.judge !== undefined) {
        mockGame.judge = body.$set.judge; // Simulate judge update
      }
      return of(null); // Simulate an observable response
    });

    component.submitUsername(); // Call the method to test

    expect(mockGame.judge).toBe(0); // Ensure judge is set to 0
    expect(httpClientSpy).toHaveBeenCalledWith(
      `/api/game/edit/test-game-id`,
      jasmine.objectContaining({
        $set: jasmine.objectContaining({
          judge: 0 // Verify the judge is set to 0 in the HTTP request
        })
      })
    );
  });

  it('should return false if any response is empty in responsesReady', () => {
    const mockGame = {
      _id: 'test-game-id',
      responses: ['Response1', '', 'Response3'], // One response is empty
      players: ['Player1', 'Player2', 'Player3'],
      judge: 0
    };
    component.game = signal(mockGame); // Mock the game object

    const result = component.responsesReady(); // Call the method

    expect(result).toBe(false); // Verify it returns false
  });

  it('should return true if all responses are filled in responsesReady', () => {
    const mockGame = {
      _id: 'test-game-id',
      responses: ['Response1', 'Response2', 'Response3'], // All responses are filled
      players: ['Player1', 'Player2', 'Player3'],
      judge: 0
    };
    component.game = signal(mockGame); // Mock the game object

    const result = component.responsesReady(); // Call the method

    expect(result).toBe(true); // Verify it returns true
  });


  it('should update judge to the selected player when winnerBecomesJudge is true in selectResponse', (done) => {
    const mockGame = {
      _id: 'test-game-id',
      players: ['Player1', 'Player2', 'Player3'],
      judge: 0,
      scores: [0, 0, 0],
      responses: ['Response1', 'Response2', 'Response3'],
      pastResponses: [],
      winnerBecomesJudge: true // Ensure winnerBecomesJudge is true
    };
    component.game = signal(mockGame); // Mock the game object
    component.playerPerm = [1, 2]; // Mock the shuffled player order


    const httpClientSpy = spyOn(component['httpClient'], 'put').and.callFake((url: any, body: { $set: { judge: number; }; }) => {
      if (body.$set.judge !== undefined) {
        component.game().judge = body.$set.judge; // Simulate judge update
      }
      return of(null); // Simulate an observable response
    });


    component.selectResponse(0); // Select the first response (index 0 in playerPerm)


    // Check if the score of the selected player is incremented
    expect(component.game().scores[1]).toBe(1);


    // Check if pastResponses is updated correctly
    expect(component.game().pastResponses).toEqual(['Response1', 'Response2', 'Response3']);


    // Check if responses are cleared
    expect(component.game().responses).toEqual(['', '', '']);


    // Wait for the asynchronous judge update
    setTimeout(() => {
      // Check if the judge is updated to the selected player
      expect(component.game().judge).toBe(1); // The selected response index becomes the new judge
      expect(httpClientSpy).toHaveBeenCalledTimes(2); // One for game state, one for judge update
      expect(httpClientSpy).toHaveBeenCalledWith(
        `/api/game/edit/test-game-id`,
        jasmine.objectContaining({
          $set: jasmine.objectContaining({
            judge: 1 // Verify the selected player becomes the judge
          })
        })
      );
      done(); // Mark the test as complete
    });
  });


  it('should update the prompt and clear the submission in submitPrompt', () => {
    const mockGame = {
      _id: 'test-game-id',
      prompt: ''
    };
    component.game = signal(mockGame); // Mock the game object
    component.submission = 'Test Prompt'; // Set a test submission


    const httpClientSpy = spyOn(component['httpClient'], 'put').and.callFake((url: any, body: any) => {
      expect(url).toBe(`/api/game/edit/test-game-id`); // Verify the correct URL
      expect(body).toEqual({ $set: { prompt: 'Test Prompt' } }); // Verify the correct payload
      return of(null); // Simulate an observable response
    });


    component.submitPrompt(); // Call the method


    expect(component.displayedPrompt).toBe('Test Prompt'); // Verify the displayed prompt is updated
    expect(component.submission).toBe(''); // Verify the submission is cleared
    expect(httpClientSpy).toHaveBeenCalled(); // Ensure the HTTP request was made
  });


  it('should fetch and update the game state in refreshGame', () => {
    const mockGame = {
      _id: 'test-game-id',
      players: ['Player1', 'Player2'],
      scores: [0, 0],
      responses: ['', '']
    };
    component.game = signal(mockGame); // Mock the initial game object


    const updatedGame = {
      _id: 'test-game-id',
      players: ['Player1', 'Player2', 'Player3'],
      scores: [0, 0, 0],
      responses: ['', '', '']
    };


    const httpClientSpy = spyOn(component['httpClient'], 'get').and.returnValue(of(updatedGame)); // Mock HTTP GET


    component.refreshGame(); // Call the method


    expect(httpClientSpy).toHaveBeenCalledWith(`/api/game/test-game-id`); // Verify the correct URL
    expect(component.game()).toEqual(updatedGame); // Verify the game state is updated
  });


  it('should reconnect WebSocket on close', (done) => {

    const reconnectSpy = spyOn(component as any, 'reconnectWebSocket').and.callThrough();
    component['socket'].onclose(new CloseEvent('close'));
    setTimeout(() => {
      expect(reconnectSpy).toHaveBeenCalled();
      done();
    }, 1100); // Wait for the reconnect timeout
  });


  it('should handle WebSocket message and refresh game', () => {
    const refreshSpy = spyOn(component, 'refreshGame').and.callThrough();
    const mockEvent = { data: 'update' } as MessageEvent;
    component['socket'].onmessage(mockEvent);
    expect(refreshSpy).toHaveBeenCalled();
  });


  it('should not refresh game on WebSocket ping message', () => {
    const refreshSpy = spyOn(component, 'refreshGame');
    const mockEvent = { data: 'ping' } as MessageEvent;
    component['socket'].onmessage(mockEvent);
    expect(refreshSpy).not.toHaveBeenCalled();
  });


  it('should handle empty username input in submitUsername', () => {
    component.usernameInput = '   '; // Empty input
    component.submitUsername();
    expect(component.username).toBe(' '); // Username should remain unchanged
  });


  it('should handle empty game ID in refreshGame', () => {
    component.game = signal(null); // No game loaded
    const httpClientSpy = spyOn(component['httpClient'], 'get');
    component.refreshGame();
    expect(httpClientSpy).not.toHaveBeenCalled(); // No HTTP request should be made
  });

  it('should update the winner when a player reaches the winning score', (done) => {
    const mockGame = {
      _id: 'test-game-id',
      players: ['Player1', 'Player2', 'Player3'],
      scores: [5, 10, 15],
      winner: null,
      winningScore: 10
    };
    component.game = signal(mockGame); // Mock the game object
    component.playerPerm = [0, 1, 2]; // Mock the player order

    const httpClientSpy = spyOn(component['httpClient'], 'put').and.callFake((url: string, body: any) => {
      expect(url).toBe(`/api/game/edit/test-game-id`); // Verify the correct URL
      expect(body).toEqual({ $set: { winner: 'Player2' } }); // Verify the correct payload
      mockGame.winner = 'Player2'; // Simulate updating the winner
      return of(null); // Simulate an observable response
    });

    // Simulate the logic to check for a winner
    for (let i = 0; i < component.playerPerm.length; i++) {
      const scores = component.game().scores;
      const winningScore = component.game().winningScore;
      if (scores[component.playerPerm[i]] >= winningScore) {
        const winner = component.game().players[component.playerPerm[i]];
        expect(winner).toBe('Player2'); // Verify the correct winner
        // Trigger the logic that calls httpClient.put
        component['httpClient'].put(`/api/game/edit/${mockGame._id}`, { $set: { winner } }).subscribe(() => {
          component.game().winner = winner; // Update the local game object
        });
        break;
      }
    }

    setTimeout(() => {
      expect(httpClientSpy).toHaveBeenCalled(); // Ensure the HTTP request was made
      expect(component.game().winner).toBe('Player2'); // Verify the local game object is updated
      done(); // Mark the test as complete
    }, 0); // Wait for the asynchronous update
  });

  describe('determineWinner', () => {
    it('should return an empty array if there are no players', () => {
      const mockGame: Game = {
        players: [], scores: [], responses: [], judge: null,
        _id: ''
      };
      component.game = signal(mockGame);
      expect(component.determineWinner()).toEqual([]);
    })
    it('should return the single winner with their score', () => {
      const mockGame: Game = {
        players: ['Alice', 'Bob', 'Charlie'], scores: [10, 25, 15], responses: [], judge: null,
        _id: ''
      };
      component.game = signal(mockGame);
      expect(component.determineWinner()).toEqual([{ player: 'Bob', score: 25}]);
    })
    it('should return multiple winners in case of a tie', () => {
      const mockGame: Game = {
        players: ['Alice', 'Bob', 'Charlie', 'David'], scores: [20, 30, 30, 25], responses: [], judge: null,
        _id: ''
      };
      component.game = signal(mockGame);
      expect(component.determineWinner()).toEqual([
        { player: 'Bob', score: 30},
        { player: 'Charlie', score:30}]);
    });
    it('should handle different score distribution correctly', () => {
      let mockGame: Game = {
        players: ['Alice', 'Bob', 'Charlie'], scores: [5, 5, 5], responses: [], judge: null,
        _id: ''
      };
      component.game = signal(mockGame);
      expect(component.determineWinner()).toEqual([
        { player: 'Alice', score: 5},
        { player: 'Bob', score: 5},
        { player: 'Charlie', score: 5}
      ]);
      mockGame = { players: ['Alice', 'Bob', 'Charlie'], scores: [30, 25, 15], responses: [], judge: null,
        _id: ''
      };
      component.game = signal(mockGame);
      expect(component.determineWinner()).toEqual([
        { player: 'Alice', score: 30}]);

    });
    it('should return multiple winners in case of a tie', () => {
      const mockGame: Game = {
        players: [], scores: [20, 30, 30, 25], responses: [], judge: null,
        _id: ''
      };
      component.game = signal(mockGame);
      expect(component.determineWinner()).toEqual([]);
    });
    it('should handle empty scores but players (edge case)', () => {
      const mockGame: Game = { players: ['Alice', 'Bob'], scores: [], responses:[], judge: null,
        _id: ''
      };
      component.game = signal(mockGame);
      expect(component.determineWinner()).toEqual([]);
    })
  })
});


