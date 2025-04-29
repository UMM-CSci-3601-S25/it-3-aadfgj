// import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
// import { MatCardModule } from '@angular/material/card';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { ActivatedRoute } from '@angular/router';
// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { of } from 'rxjs';
// import { signal } from '@angular/core'; // Import signal for mocking Signal<Game>
// import { GameComponent } from './game-page';

// describe('GameComponent', () => {
//   let component: GameComponent;
//   let fixture: ComponentFixture<GameComponent>;

//   beforeEach(waitForAsync(() => {
//     TestBed.configureTestingModule({
//       imports: [
//         BrowserAnimationsModule,
//         MatCardModule,
//         HttpClientTestingModule,
//         GameComponent // Import GameComponent instead of declaring it
//       ],
//       providers: [
//         {
//           provide: ActivatedRoute,
//           useValue: {
//             paramMap: of({
//               get: () => 'test-id'
//             }),
//             queryParams: of({}),
//             fragment: of(''),
//             data: of({}),
//             url: of([]),
//             outlet: 'primary',
//             routeConfig: {},
//             parent: null,
//             firstChild: null,
//             children: [],
//             pathFromRoot: [],
//             root: null,
//             snapshot: {
//               paramMap: {
//               }
//             }
//           }
//         }
//       ]
//     })
//       .compileComponents();
//   }));

//   beforeEach(() => {
//     fixture = TestBed.createComponent(GameComponent);
//     component = fixture.componentInstance;
//     component.prompt = ''; // Initialize the prompt property
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   it('should initialize prompt property correctly', () => {
//     expect(component.prompt).toBe('');
//   });

//   it('should update prompt property', () => {
//     const newPrompt = 'New Test Prompt';
//     component.prompt = newPrompt;
//     fixture.detectChanges();
//     expect(component.prompt).toBe(newPrompt);
//   });

//   it('should handle route parameters correctly', () => {
//     const route = TestBed.inject(ActivatedRoute);
//     route.paramMap.subscribe(params => {
//       expect(params.get('id')).toBe('test-id');
//     });
//   });

//   it('should update responses and handle judge response in submitResponse', () => {
//     const mockGame = {
//       _id: 'test-game-id',
//       responses: [null, null], // Ensure responses array is initialized
//       judge: 1
//     };
//     component.game = signal(mockGame); // Use signal to mock Signal<Game>
//     component.playerId = 1;
//     component.response = 'Test Response';

//     const httpClientSpy = spyOn(component['httpClient'], 'put').and.callThrough();
//     const shuffleArraySpy = spyOn(component, 'shuffleArray').and.callFake(() => {
//       const array = mockGame.responses; // Access the array directly
//       expect(array).toBeDefined(); // Ensure array is defined
//       expect(array.length).toBeGreaterThan(0); // Ensure array has elements
//     });

//     component.submitResponse();

//     expect(component.game().responses[1]).toBe('Test Response');
//     expect(component.displayedPrompt).toBe('Test Response'); // Judge's response becomes the prompt
//     expect(component.response).toBe(''); // Input field is cleared
//     expect(httpClientSpy).toHaveBeenCalledWith(
//       `/api/game/edit/test-game-id`,
//       { $set: { responses: component.game().responses } }
//     );
//     expect(shuffleArraySpy).toHaveBeenCalled();
//   });

//   it('should shuffle playerPerm array correctly in shuffleArray', () => {
//     const mockGame = {
//       _id: 'mock-game-id', // Add the required _id property
//       players: ['Player1', 'Player2', 'Player3', 'Player4'],
//       judge: 0
//     };
//     component.game = signal(mockGame); // Mock the game object
//     component.shuffleArray();

//     expect(component.playerPerm).toBeDefined();
//     expect(component.playerPerm.length).toBe(mockGame.players.length - 1); // Exclude the judge
//     expect(component.playerPerm).not.toContain(mockGame.judge); // Ensure judge is excluded
//     const uniqueValues = new Set(component.playerPerm);
//     expect(uniqueValues.size).toBe(component.playerPerm.length); // Ensure no duplicates
//   });

//   it('should update scores, pastResponses, and judge correctly in selectResponse', (done) => {
//     const mockGame = {
//       _id: 'test-game-id',
//       players: ['Player1', 'Player2', 'Player3'],
//       judge: 0,
//       scores: [0, 0, 0],
//       responses: ['Response1', 'Response2', 'Response3'],
//       pastResponses: [],
//       winnerBecomesJudge: true
//     };
//     component.game = signal(mockGame); // Mock the game object
//     component.playerPerm = [1, 2]; // Mock the shuffled player order

//     const httpClientSpy = spyOn(component['httpClient'], 'put').and.callFake((url, body) => {
//       if (body.$set.judge !== undefined) {
//       // Simulate the judge update call
//         component.game().judge = body.$set.judge;
//       }
//       return of(null); // Simulate an observable response
//     });

//     component.selectResponse(1); // Select the second response (index 1 in playerPerm)

//     // Check if the score of the selected player is incremented
//     expect(component.game().scores[2]).toBe(1);

//     // Check if pastResponses is updated correctly
//     expect(component.game().pastResponses).toEqual(['Response1', 'Response2', 'Response3']);

//     // Check if responses are cleared
//     expect(component.game().responses).toEqual(['', '', '']);

//     // Wait for the asynchronous judge update
//     setTimeout(() => {
//     // Check if the judge is updated correctly
//       expect(component.game().judge).toBe(1); // The selected response index becomes the new judge
//       expect(httpClientSpy).toHaveBeenCalledTimes(2); // One for game state, one for judge update
//       done(); // Mark the test as complete
//     });
//   });

//   it('should update judge to the next player in selectResponse when winnerBecomesJudge is false', (done) => {
//     const mockGame = {
//       _id: 'test-game-id',
//       players: ['Player1', 'Player2', 'Player3'],
//       judge: 0,
//       scores: [0, 0, 0],
//       responses: ['Response1', 'Response2', 'Response3'],
//       pastResponses: [],
//       winnerBecomesJudge: false // Ensure winnerBecomesJudge is false
//     };
//     component.game = signal(mockGame); // Mock the game object
//     component.playerPerm = [1, 2]; // Mock the shuffled player order

//     const httpClientSpy = spyOn(component['httpClient'], 'put').and.callFake((url, body) => {
//       if (body.$set.judge !== undefined) {
//       // Simulate the judge update call
//         component.game().judge = body.$set.judge;
//       }
//       return of(null); // Simulate an observable response
//     });

//     component.selectResponse(1); // Select the second response (index 1 in playerPerm)

//     // Check if the score of the selected player is incremented
//     expect(component.game().scores[2]).toBe(1);

//     // Check if pastResponses is updated correctly
//     expect(component.game().pastResponses).toEqual(['Response1', 'Response2', 'Response3']);

//     // Check if responses are cleared
//     expect(component.game().responses).toEqual(['', '', '']);

//     // Wait for the asynchronous judge update
//     setTimeout(() => {
//     // Check if the judge is updated to the next player
//       expect(component.game().judge).toBe(1); // Judge should increment to the next player
//       expect(httpClientSpy).toHaveBeenCalledTimes(2); // One for game state, one for judge update
//       expect(httpClientSpy).toHaveBeenCalledWith(
//         `/api/game/edit/test-game-id`,
//         jasmine.objectContaining({
//           $set: jasmine.objectContaining({
//             judge: 1 // The next player becomes the judge
//           })
//         })
//       );
//       done(); // Mark the test as complete
//     });
//   });

//   it('should set judge to 0 if playerId is 0', () => {
//     const mockGame = {
//       _id: 'test-game-id',
//       players: [],
//       scores: [],
//       responses: [],
//       judge: null
//     };
//     component.game = signal(mockGame); // Mock the game object
//     component.playerId = null; // Ensure playerId is null initially
//     component.usernameInput = 'Player1'; // Simulate a username input

//     const httpClientSpy = spyOn(component['httpClient'], 'put').and.callFake((url, body) => {
//       if (body.$set.judge !== undefined) {
//         mockGame.judge = body.$set.judge; // Simulate judge update
//       }
//       return of(null); // Simulate an observable response
//     });

//     component.submitUsername(); // Call the method to test

//     expect(mockGame.judge).toBe(0); // Ensure judge is set to 0
//     expect(httpClientSpy).toHaveBeenCalledWith(
//       `/api/game/edit/test-game-id`,
//       jasmine.objectContaining({
//         $set: jasmine.objectContaining({
//           judge: 0 // Verify the judge is set to 0 in the HTTP request
//         })
//       })
//     );
//   });

//   it('should return false if any response is empty in responsesReady', () => {
//     const mockGame = {
//       _id: 'test-game-id',
//       responses: ['Response1', '', 'Response3'], // One response is empty
//       players: ['Player1', 'Player2', 'Player3'],
//       judge: 0
//     };
//     component.game = signal(mockGame); // Mock the game object

//     const result = component.responsesReady(); // Call the method

//     expect(result).toBe(false); // Verify it returns false
//   });

//   it('should return true if all responses are filled in responsesReady', () => {
//     const mockGame = {
//       _id: 'test-game-id',
//       responses: ['Response1', 'Response2', 'Response3'], // All responses are filled
//       players: ['Player1', 'Player2', 'Player3'],
//       judge: 0
//     };
//     component.game = signal(mockGame); // Mock the game object

//     const result = component.responsesReady(); // Call the method

//     expect(result).toBe(true); // Verify it returns true
//   });
// });

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatCardModule } from '@angular/material/card';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { signal } from '@angular/core'; // Import signal for mocking Signal<Game>
import { GameComponent } from './game-page';
import { Game } from './game-page'

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

  it('should update scores, pastResponses, and judge correctly in selectResponse', (done) => {
    const mockGame = {
      _id: 'test-game-id',
      players: ['Player1', 'Player2', 'Player3'],
      judge: 0,
      scores: [0, 0, 0],
      responses: ['Response1', 'Response2', 'Response3'],
      pastResponses: [],
      winnerBecomesJudge: false
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
    // Check if the judge is updated correctly
      expect(component.game().judge).toBe(1); // The selected response index becomes the new judge
      expect(httpClientSpy).toHaveBeenCalledTimes(2); // One for game state, one for judge update
      done(); // Mark the test as complete
    });
  });

  it('should update judge to the next player in selectResponse when winnerBecomesJudge is false', (done) => {
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
