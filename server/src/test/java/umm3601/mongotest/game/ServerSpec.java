// package umm3601.mongotest.game;

// import static org.mockito.Mockito.atLeastOnce;
// import static org.mockito.Mockito.mock;
// import static org.mockito.Mockito.never;
// import static org.mockito.Mockito.verify;
// import static org.mockito.Mockito.when;

// import java.util.Set;
// import java.util.concurrent.ConcurrentHashMap;

// import org.junit.jupiter.api.BeforeEach;
// import org.junit.jupiter.api.Test;

// import io.javalin.websocket.WsContext;
// import umm3601.Controller;
// import umm3601.Server;


// // public class ServerSpec {


// //   private Server server;
// //   private Set<WsContext> mockConnectedClients;

// //   @BeforeEach
// //   void setup() {
// //     // Mock the connected clients set
// //     mockConnectedClients = ConcurrentHashMap.newKeySet();
// //     Server.connectedClients = mockConnectedClients;

// //     // Mock the MongoClient and Controller array (not used in this test)
// //     server = new Server(null, new Controller[0]);
// //   }

// //   @Test
// //   void testStartWebSocketPing() throws InterruptedException {
// //     // Mock a WebSocket context
// //     WsContext mockClient = mock(WsContext.class);
// //     // Mock the session object
// //     org.eclipse.jetty.websocket.api.Session mockSession = mock(org.eclipse.jetty.websocket.api.Session.class);
// //     when(mockSession.isOpen()).thenReturn(true);
// //     when(mockClient.session).thenReturn(mockSession);

// //     // Add the mock client to the connected clients set
// //     mockConnectedClients.add(mockClient);

// //     // Start the WebSocket ping mechanism
// //     server.startWebSocketPing();

// //     // Wait for a bit to allow the TimerTask to execute
// //     Thread.sleep(100);

// //     // Verify that the "ping" message was sent to the mock client
// //     verify(mockClient, atLeastOnce()).send("ping");
// //   }

// //   @Test
// //   void testStartWebSocketPingWithClosedSession() throws InterruptedException {
// //     // Mock a WebSocket context with a closed session
// //     WsContext mockClient = mock(WsContext.class);
// //     when(mockClient.session.isOpen()).thenReturn(false);

// //     // Add the mock client to the connected clients set
// //     mockConnectedClients.add(mockClient);

// //     // Start the WebSocket ping mechanism
// //     server.startWebSocketPing();

// //     // Wait for a bit to allow the TimerTask to execute
// //     Thread.sleep(100);

// //     // Verify that the "ping" message was not sent to the mock client
// //     verify(mockClient, never()).send("ping");
// //   }
// // }
