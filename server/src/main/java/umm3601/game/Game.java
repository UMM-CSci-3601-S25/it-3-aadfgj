package umm3601.game;

import org.mongojack.Id;
import org.mongojack.ObjectId;

@SuppressWarnings({"VisibilityModifier"})
public class Game {
  @ObjectId @Id
  @SuppressWarnings({"MemberName"})
  public String _id;

  public String[] players;
  public String[] responses;
  public int judge;
  public int[] scores;
  public boolean discardLast;
  public boolean winnerBecomesJudge;
  public String[] pastResponses;
  public int winningScore;
  public String winner; // Add a field to store the winner's name
}
