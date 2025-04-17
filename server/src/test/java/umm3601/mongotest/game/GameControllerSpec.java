package umm3601.mongotest.game;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.Map;

import org.bson.BsonArray;
import org.bson.BsonString;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import io.javalin.Javalin;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.NotFoundResponse;
import umm3601.game.Game;
import umm3601.game.GameController;

class GameControllerSpec {

  private ObjectId gameID;

  private GameController gameController;

  @Mock
  private Javalin mockServer;

  private static MongoClient mongoClient;
  private static MongoDatabase db;

  @Mock
  private Context ctx;

  @Captor
  private ArgumentCaptor<Map<String, String>> mapCaptor;

  @Captor
  private ArgumentCaptor<Game> gameCaptor;

  @BeforeAll
  static void setupAll() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");

    mongoClient = MongoClients.create(
        MongoClientSettings.builder()
            .applyToClusterSettings(builder -> builder.hosts(Collections.singletonList(new ServerAddress(mongoAddr))))
            .build());
    db = mongoClient.getDatabase("test");
  }

  @AfterAll
  static void teardown() {
    db.drop();
    mongoClient.close();
  }

  @BeforeEach
  void setupEach() throws IOException {
    MockitoAnnotations.openMocks(this);

    MongoCollection<Document> gameDocuments = db.getCollection("games");
    gameDocuments.drop();

    gameID = new ObjectId();

    BsonArray usernames = new BsonArray();
    usernames.add(new BsonString("Kristin"));
    usernames.add(new BsonString("Jeff"));

    BsonArray responses = new BsonArray();
    responses.add(new BsonString("apple"));
    responses.add(new BsonString("banana"));
    responses.add(new BsonString("grape"));

    Document newGame = new Document()
        .append("players", usernames)
        .append("prompt", "What is the meaning of life?")
        .append("responses", responses)
        .append("judge", 1)
        .append("discardLast", true)
        .append("winnerBecomesJudge", false)
        .append("_id", gameID);

    gameDocuments.insertOne(newGame);

    gameController = new GameController(db);
  }

  @Test
  void getGameWithExistentId() throws IOException {
    String id = gameID.toHexString();
    when(ctx.pathParam("id")).thenReturn(id);

    gameController.getGame(ctx);

    verify(ctx).json(gameCaptor.capture());
    verify(ctx).status(HttpStatus.OK);
    assertEquals(gameID.toHexString(), gameCaptor.getValue()._id);
  }

  @Test
  void getGameWithNonexistentId() throws IOException {
    String id = new ObjectId().toHexString();
    when(ctx.pathParam("id")).thenReturn(id);

    assertThrows(NotFoundResponse.class, () -> {
      gameController.getGame(ctx);
    });
  }

  @Test
  void getGameWithNULLId() throws IOException {
    when(ctx.pathParam("id")).thenReturn(null);

    assertThrows(BadRequestResponse.class, () -> {
      gameController.getGame(ctx);
    });
  }

  @Test
  void editGameWithExistentId() throws IOException {
    String id = gameID.toHexString();
    when(ctx.pathParam("id")).thenReturn(id);

    Document updatedGame = new Document("$set", new Document()
        .append("prompt", "Updated prompt")
        .append("judge", 2));
    when(ctx.body()).thenReturn(updatedGame.toJson());

    gameController.editGame(ctx);

    verify(ctx).status(HttpStatus.OK);
    verify(ctx).body();
  }

  @Test
  void editGameWithInvalidData() throws IOException {
    String id = gameID.toHexString();
    when(ctx.pathParam("id")).thenReturn(id);

    // Invalid data: 'judge' is a string instead of an integer
    Document invalidGame = new Document("$set", new Document()
        .append("judge", "invalid")); // Invalid data type for judge
    when(ctx.body()).thenReturn(invalidGame.toJson());

    // Ensure the controller throws a BadRequestResponse
    assertThrows(BadRequestResponse.class, () -> {
      gameController.editGame(ctx);
    });

    // Verify no changes were made to the database
    MongoCollection<Document> gameDocuments = db.getCollection("games");
    Document gameInDb = gameDocuments.find(new Document("_id", new ObjectId(id))).first();
    assertNotNull(gameInDb);
    assertEquals(1, gameInDb.getInteger("judge")); // Original value should remain unchanged
  }

  @Test
  void editGameWithNonexistentId() throws IOException {
    String id = new ObjectId().toHexString(); // Generate a valid but nonexistent ID
    when(ctx.pathParam("id")).thenReturn(id);

    Document updatedGame = new Document("$set", new Document()
        .append("prompt", "Updated prompt")
        .append("judge", 2));
    when(ctx.body()).thenReturn(updatedGame.toJson());

    // Ensure the controller throws an IllegalArgumentException
    assertThrows(IllegalArgumentException.class, () -> {
      gameController.editGame(ctx);
    });

    // Verify no changes were made to the database
    MongoCollection<Document> gameDocuments = db.getCollection("games");
    Document gameInDb = gameDocuments.find(new Document("_id", new ObjectId(id))).first();
    assertEquals(null, gameInDb); // Ensure no game was found or modified
  }

  @Test
  void createNewGame() throws IOException {
    // Create a valid Game object
    Game newGame = new Game();
    newGame.players = new String[]{"Alice", "Bob"};
    newGame.prompt = "New game prompt";
    newGame.responses = new String[]{"Response1", "Response2"};
    newGame.judge = 0;
    newGame.discardLast = false;
    newGame.winnerBecomesJudge = true;

    // Mock the bodyValidator to return the newGame object
    io.javalin.validation.BodyValidator<Game> mockBodyValidator = org.mockito.Mockito.mock(io.javalin.validation.BodyValidator.class);
    when(ctx.bodyValidator(Game.class)).thenReturn(mockBodyValidator);
    when(mockBodyValidator.get()).thenReturn(newGame);

    // Call the method to add a new game
    gameController.addNewGame(ctx);

    // Verify the response status
    verify(ctx).status(HttpStatus.CREATED);

    // Verify the response contains the ID of the newly created game
    ArgumentCaptor<Map<String, String>> responseCaptor = ArgumentCaptor.forClass(Map.class);
    verify(ctx).json(responseCaptor.capture());
    Map<String, String> jsonResponse = responseCaptor.getValue();
    assertNotNull(jsonResponse.get("id"));

    // Verify the game was inserted into the database
    MongoCollection<Document> gameDocuments = db.getCollection("games");
    Document insertedGame = gameDocuments.find(new Document("prompt", "New game prompt")).first();
    assertNotNull(insertedGame);
    assertEquals("New game prompt", insertedGame.getString("prompt"));
    assertEquals(Arrays.asList("Alice", "Bob"), insertedGame.getList("players", String.class));
  }
}
