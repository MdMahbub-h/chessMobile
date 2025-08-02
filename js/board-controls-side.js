// Right panel control buttons logic

// Reset board to classic starting position
$("#btn-new-game").click(function () {
  console.log("Making new game.");
  gameStarted = false;
  gameEnd = false;

  stopTimer();

  $("#game-settings").removeClass("hidden");
  $("#btn-choose-white-side, #btn-choose-black-side").removeClass("locked");

  $("#btn-choose-black-side").removeClass("selected");
  $("#btn-choose-white-side").addClass("selected");

  playerSide = "w";
  opponentSide = "b";
  firstTurn = "player";

  $("#btn-undo-move").addClass("hidden");
  $("#game-state").addClass("hidden");

  $("#btn-switch-sides").prop("disabled", false).removeClass("disabled");
  $("#btn-show-hint").prop("disabled", false).removeClass("disabled");

  game = new Chess("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  board.position("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

  if (playerSide === "b") {
    game.load("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1");
    board.position("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1");
    opponentTurn();
  } else {
    board.position("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    $("#board").removeClass("locked");
    $("#game-turns-history ol").html("");
  }
});

// Empty board and enable custom pieces
$("#btn-empty-board").click(function () {
  stopTimer();
  $("#game-timer").addClass("hidden");
  $("#btn-choose-white-side, #btn-choose-black-side").removeClass("locked");
  $("#btn-undo-move").addClass("hidden");
  $("#board").removeClass("locked");

  $("body").find('img[data-piece="wP"]').remove();
  $(window).unbind();

  board.clear();

  board = ChessBoard("board", {
    draggable: true,
    dropOffBoard: "trash",
    sparePieces: true,
  });

  boardPieces = true;
  $("#game-turn").addClass("hidden");
});

// Load PGN
$("#btn-load-pgn").click(function () {
  $("#board-load-fen-area, #board-save-pgn-area").addClass("hidden");
  $("#board-load-pgn-area")
    .toggleClass("hidden")
    .find("textarea")
    .focus()
    .select();
});

$("#board-load-pgn-area button").click(function () {
  eventLoadPgnData();
  $("#board-load-pgn-area").addClass("hidden");
});

$("#board-load-pgn-area textarea").keydown(function (e) {
  if (e.keyCode === 13) {
    e.preventDefault();
    eventLoadPgnData();
    $("#board-load-pgn-area").addClass("hidden");
  }
});

function eventLoadPgnData() {
  const pgn = $("#board-load-pgn-area textarea").val();
  if (!pgn) return;

  Init("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
  SetPgnMoveText(pgn);
  let ff_new = "",
    ff_old = "",
    fenString = "";

  do {
    ff_old = ff_new;
    MoveForward(1);
    ff_new = GetFEN();
    if (ff_old !== ff_new) fenString = ff_new;
  } while (ff_old !== ff_new);

  console.log("PGN converted to FEN: " + fenString);
  loadBoard(fenString);
  checkTurn();
  checkAnalyzeOption();
}

$("#board-load-pgn-area .close").click(function () {
  $("#board-load-pgn-area").addClass("hidden");
});

// Load FEN
$("#btn-load-fen").click(function () {
  $("#board-load-pgn-area, #board-save-pgn-area").addClass("hidden");
  $("#board-load-fen-area")
    .toggleClass("hidden")
    .find("textarea")
    .focus()
    .select();
});

$("#board-load-fen-area button").click(function () {
  eventLoadFenData();
  $("#board-load-fen-area").addClass("hidden");
});

$("#board-load-fen-area textarea").keydown(function (e) {
  if (e.keyCode === 13) {
    e.preventDefault();
    eventLoadFenData();
    $("#board-load-fen-area").addClass("hidden");
  }
});

function eventLoadFenData() {
  const fenString = $("#board-load-fen-area textarea").val();
  const validation = game.validate_fen(fenString);
  if (!validation.valid) {
    console.error("FEN Error:", validation.error);
    return;
  }

  loadBoard(fenString);
  checkTurn();
  checkAnalyzeOption();
}

$("#board-load-fen-area .close").click(function () {
  $("#board-load-fen-area").addClass("hidden");
});

$("#board-save-pgn-area button, #board-save-pgn-area .close").click(
  function () {
    $("#board-save-pgn-area").addClass("hidden");
  }
);

$("#board-save-pgn-area textarea").keydown(function (e) {
  if (e.keyCode === 13) {
    $("#board-save-pgn-area").addClass("hidden");
  }
});

// Analyze
$("#btn-analyze").click(function () {
  if ($(this).hasClass("disabled")) return;
  stateAnalyze = "grep";
  $(this).addClass("disabled loading");
  console.log("Analyze " + game.fen());
  stockfish.postMessage("position fen " + game.fen());
  stockfish.postMessage("go depth " + staticSkill);
});

function checkAnalyzeOption() {
  if (game.turn() !== playerSide) {
    $("#btn-analyze").addClass("disabled");
  } else {
    $("#btn-analyze").removeClass("disabled");
  }
}

$("#btn-settings").click(function () {
  $("#game-difficulty-skill-settings").toggleClass("hidden");
});

// Choose white side
$("#btn-choose-white-side").click(function () {
  if ($(this).hasClass("locked")) return;
  playerSide = "w";
  opponentSide = "b";

  $("#game-settings .btn").removeClass("selected");
  $(this).addClass("selected");
  $("#game-settings .btn").addClass("locked");

  if (typeof board.setOrientation === "function") {
    board.setOrientation(playerSide);
  } else {
    board.orientation("white");
  }

  // Remove side selection after choosing
  $("#game-settings").addClass("hidden");
});

// Choose black side
$("#btn-choose-black-side").click(function () {
  if ($(this).hasClass("locked")) return;
  playerSide = "b";
  opponentSide = "w";

  $("#game-settings .btn").removeClass("selected");
  $(this).addClass("selected");
  $("#game-settings .btn").addClass("locked");

  if (typeof board.setOrientation === "function") {
    board.setOrientation(playerSide);
  } else {
    board.orientation("black");
  }

  opponentTurn();

  // Remove side selection after choosing
  $("#game-settings").addClass("hidden");
});

// Resign
$("#btn-resign").click(function () {
  $("#board-resign-game-area").toggleClass("hidden");
});

$("#board-resign-game-area .close, #board-resign-game-area .no").click(
  function () {
    $("#board-resign-game-area").addClass("hidden");
  }
);

$("#board-resign-game-area .yes").click(function () {
  gameEnd = true;
  stopTimer();
  $("#game-state").text("Game ended.").removeClass("hidden");
  $("#game-timer").addClass("hidden");
  $("#board").addClass("locked");
  $("#board-resign-game-area").addClass("hidden");
});
