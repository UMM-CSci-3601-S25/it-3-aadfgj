package umm3601.mongotest.game;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import umm3601.game.Game;
import org.bson.Document;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;

public class GameSpec {


  private Game game;

  @BeforeEach
  public void setup() {
    game = new Game();
    game._id = "12345";
    game.players = new String[]{"Alice", "Bob"};
    //game.prompt = "What is the meaning of life?";
    game.responses = new String[]{"42", "To be happy"};
    game.judge = 1;
    game.discardLast = true;
    game.winnerBecomesJudge = false;
  }

  @Test
  public void testGameId() {
    assertEquals("12345", game._id);
  }

  @Test
  public void testGamePlayers() {
    assertArrayEquals(new String[]{"Alice", "Bob"}, game.players);
  }

  // @Test
  // public void testGamePrompt() {
  //   game.prompt = "What is the meaning of life?";
  //   assertEquals("What is the meaning of life?", game.prompt);
  // }

  @Test
  public void testGameResponses() {
    assertArrayEquals(new String[]{"42", "To be happy"}, game.responses);
  }

  @Test
  public void testGameJudge() {
    assertEquals(1, game.judge);
  }

  @Test
  public void testGameDiscardLast() {
    assertEquals(true, game.discardLast);
  }

  @Test
  public void testGameWinnerBecomesJudge() {
    assertEquals(false, game.winnerBecomesJudge);
  }

  @Test
  public void testGameNotNull() {
    assertNotNull(game);
  }

  @Test
  public void testGameWithNoPlayers() {
    game.players = new String[]{};
    assertArrayEquals(new String[]{}, game.players);
  }

  @Test
  public void testGameWithNoResponses() {
    game.responses = new String[]{};
    assertArrayEquals(new String[]{}, game.responses);
  }

  @Test
  public void testGameWithNullPlayers() {
    game.players = null;
    assertEquals(null, game.players);
  }

  @Test
  public void testGameWithNullResponses() {
    game.responses = null;
    assertEquals(null, game.responses);
  }

  @Test
  public void testGameWithEmptyId() {
    game._id = "";
    assertEquals("", game._id);
  }

  @Test
  public void testGameWithNegativeJudge() {
    game.judge = -1;
    assertEquals(-1, game.judge);
  }

  @Test
  public void testJudgeMustBeInteger() {
    try {
      game.judge = Integer.parseInt("notAnInteger");
    } catch (NumberFormatException e) {
      assertEquals("For input string: \"notAnInteger\"", e.getMessage());
    }
  }

  @Test
  public void testSetDocumentValidation() {
    try {
      // Simulate invalid update format
      String invalidUpdate = "{ \"invalidKey\": \"value\" }";
      Document.parse(invalidUpdate);
      throw new AssertionError("Expected BadRequestResponse was not thrown");
    } catch (Exception e) {
      assertEquals("Invalid JSON format in request body.", e.getMessage());
    }
  }

}
