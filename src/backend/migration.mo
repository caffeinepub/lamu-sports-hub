import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Storage "blob-storage/Storage";

module {
  type UserId = Principal;
  type TeamId = Text;
  type PlayerId = Text;
  type MatchId = Text;
  type NotificationId = Text;
  type NewsId = Text;

  module UserProfile {
    public type Role = {
      #admin;
      #coach;
      #player;
      #fan;
    };

    public type T = {
      userId : Text;
      name : Text;
      phone : Text;
      email : Text;
      role : Role;
      area : Text;
      favoriteTeamId : ?TeamId;
    };
  };

  module Team {
    public type T = {
      teamId : TeamId;
      name : Text;
      area : Text;
      coachId : Text;
      wins : Nat;
      losses : Nat;
      draws : Nat;
      goalsFor : Nat;
      goalsAgainst : Nat;
      isApproved : Bool;
      logo : ?Storage.ExternalBlob;
    };
  };

  module Player {
    public type Position = {
      #goalkeeper;
      #defender;
      #midfielder;
      #forward;
    };

    public type T = {
      playerId : PlayerId;
      userId : Text;
      teamId : TeamId;
      nickname : Text;
      position : Position;
      jerseyNumber : Nat;
      matchesPlayed : Nat;
      goals : Nat;
      assists : Nat;
      yellowCards : Nat;
      redCards : Nat;
      photo : ?Storage.ExternalBlob;
    };
  };

  module Match {
    public type Status = {
      #scheduled;
      #live;
      #played;
    };

    public type T = {
      matchId : MatchId;
      homeTeam : TeamId;
      awayTeam : TeamId;
      homeScore : Nat;
      awayScore : Nat;
      date : Int;
      mvpPlayerId : ?PlayerId;
      status : Status;
      commentary : [Text];
    };
  };

  type OldActor = {
    userProfiles : Map.Map<UserId, UserProfile.T>;
    userProfilesByUserId : Map.Map<Text, UserProfile.T>;
    teams : Map.Map<TeamId, Team.T>;
    players : Map.Map<PlayerId, Player.T>;
    matches : Map.Map<MatchId, Match.T>;
  };

  module PlayerMigration {
    public type T = {
      playerId : PlayerId;
      userId : Text;
      teamId : TeamId;
      nickname : Text;
      name : Text;
      position : Player.Position;
      jerseyNumber : Nat;
      matchesPlayed : Nat;
      goals : Nat;
      assists : Nat;
      yellowCards : Nat;
      redCards : Nat;
      photo : ?Storage.ExternalBlob;
      isVerified : Bool;
    };

    public func fromOld(old : Player.T) : T {
      { old with name = "Unknown"; isVerified = false };
    };
  };

  module MatchMigration {
    public type T = {
      matchId : MatchId;
      homeTeam : TeamId;
      awayTeam : TeamId;
      homeScore : Nat;
      awayScore : Nat;
      date : Int;
      kickoffTime : Text;
      mvpPlayerId : ?PlayerId;
      status : Match.Status;
      commentary : [Text];
    };

    public func fromOld(old : Match.T) : T {
      { old with kickoffTime = ""; date = old.date };
    };
  };

  type NewActor = {
    userProfiles : Map.Map<UserId, UserProfile.T>;
    userProfilesByUserId : Map.Map<Text, UserProfile.T>;
    teams : Map.Map<TeamId, Team.T>;
    players : Map.Map<PlayerId, PlayerMigration.T>;
    matches : Map.Map<MatchId, MatchMigration.T>;
  };

  public func run(old : OldActor) : NewActor {
    let players = old.players.map<PlayerId, Player.T, PlayerMigration.T>(
      func(_id, old) { PlayerMigration.fromOld(old) }
    );
    let matches = old.matches.map<MatchId, Match.T, MatchMigration.T>(
      func(_id, old) { MatchMigration.fromOld(old) }
    );
    { old with players; matches };
  };
};
