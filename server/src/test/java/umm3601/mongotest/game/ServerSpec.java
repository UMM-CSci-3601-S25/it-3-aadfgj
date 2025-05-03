// the following code was ment to test the heartbeat function in the server


// package umm3601.mongotest.game;

// import umm3601.game.Game;
// import umm3601.game.GameController;
// import static org.mockito.Mockito.*;
// import io.javalin.websocket.WsContext;
// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Test;
// import java.util.Set;
// import java.util.Timer;
// import java.util.concurrent.ConcurrentHashMap;

// class Server {

//     private static final long HEARTBEAT_INTERVAL = 1000L; // Define the interval in milliseconds
//     private Server server;
//     private Timer mockTimer;

//     @BeforeEach
//     void setUp() {
//         // Initialize the server and mock Timer
//         server = new Server();
//         mockTimer = mock(Timer.class);    }


//     @Test
//     void testStartHeartbeat() {
//       // Mock the connected clients and their alive status
//       Set<WsContext> mockConnectedClients = ConcurrentHashMap.newKeySet();
//       WsContext mockClient1 = mock(WsContext.class);
//       WsContext mockClient2 = mock(WsContext.class);

//       when(mockClient1.session.isOpen()).thenReturn(true);
//       when(mockClient2.session.isOpen()).thenReturn(true);

//       mockConnectedClients.add(mockClient1);
//       mockConnectedClients.add(mockClient2);

//       // Call the method under test
//       // server.startHeartbeat();

//       // Verify that the Timer's scheduleAtFixedRate method was called
//       verify(mockTimer, times(1)).scheduleAtFixedRate(any(),
//       eq(Server.HEARTBEAT_INTERVAL), eq(Server.HEARTBEAT_INTERVAL));

//       // Verify that the initial ping was sent to all connected clients
//       verify(mockClient1, times(1)).send("ping");
//       verify(mockClient2, times(1)).send("ping");
//     }
// }
