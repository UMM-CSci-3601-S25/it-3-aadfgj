import { defineConfig } from 'cypress';
import { environment } from './src/environments/environment';
import { WebSocketSubject } from 'rxjs/webSocket';

let webSocketSubject;

export default defineConfig({
  e2e: {
    setupNodeEvents: (on, config) => {
      on("task", {
        connect() {
          webSocketSubject = new WebSocketSubject(`${environment.wsUrl}`);
          webSocketSubject.next("connected");
          return null; //cypress needs some returned thing (can be null)
        },
        addPlayer(message) {
          webSocketSubject = new WebSocketSubject(`${environment.wsUrl}`);
          const { type, gameId, playerName } = message;
          //webSocketService = new WebSocketService();
          //webSocketService.webSocketSubject = webSocketSubject;
          //webSocketService.sendMessage({ type, gameId, playerName});
          return null;
          // https://medium.com/@codeandbird/end-to-end-testing-of-websocket-chat-app-with-cypress-cy-task-command-aa30471a60b8
          // https://www.youtube.com/watch?v=0iJ-n6VdbFY&t=324s
          // {type: 'ADD_PLAYER',
          //   gameId: this.joinGameForm.value.gameId,
          //   playerName: this.joinGameForm.value.playerName,
          // };

        }
      });
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('./cypress/plugins/index.ts').default(on, config);
    },
  },
});
