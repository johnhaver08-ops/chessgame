let mode = null;
let statusBar = null;
let aiLevel = "easy";

function showNameInputs(selectedMode){
  mode = selectedMode;
  document.getElementById("nameInputs").classList.remove("hidden");

  if(mode === "pvp"){
    document.getElementById("pvpInputs").classList.remove("hidden");
    document.getElementById("pveInputs").classList.add("hidden");
    document.getElementById("startPvPBtn").classList.remove("hidden");
    document.getElementById("startPVEBtn").classList.add("hidden");
  } else {
    document.getElementById("pveInputs").classList.remove("hidden");
    document.getElementById("pvpInputs").classList.add("hidden");
    document.getElementById("startPVEBtn").classList.add("hidden");
  }
}

function setDifficulty(level, btn){
  aiLevel = level;
  document.querySelectorAll("#difficultySelection .modeBtn").forEach(b => b.classList.remove("selected"));
  if(btn) btn.classList.add("selected");
  document.getElementById("startPVEBtn").classList.remove("hidden");
}

function startGame(selectedMode){
  mode = selectedMode;
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("gameUI").classList.remove("hidden");

  if(mode === "pvp"){
    players.w = document.getElementById("p1Name").value || "Player 1";
    players.b = document.getElementById("p2Name").value || "Player 2";
  } else {
    players.w = document.getElementById("playerName").value || "You";
    players.b = "AI";
    playerSide = "w";
  }

  statusBar = document.getElementById("statusBar");
  initBoard();
}

function updateStatus(){
  if(gameOver) return;

  let text = "";
  if(mode === "pvp"){
    text = players[turn] + " (" + (turn==="w" ? "White" : "Black") + ")'s Turn";
  } else {
    text = (turn==="w" ? players.w + " (You)" : players.b) + "'s Turn";
  }

  if(statusBar) statusBar.textContent = text;
}

function restartGame(){
  const overlay = document.getElementById("winsPopupOverlay");
  const popup = document.getElementById("winsPopup");
  if(overlay) { overlay.classList.add("hidden"); overlay.style.display = "none"; }
  if(popup){ popup.style.opacity = "0"; popup.style.transform = "scale(0.8)"; }

  turn = "w";
  playerSide = "w";
  gameOver = false;
  selected = null;
  possibleMoves = [];
  promotionSquare = null;
  wins.w = 0;
  wins.b = 0;

  initBoard();
  updateStatus();

  const scoreboard = document.getElementById("scoreBoard");
  if(scoreboard) scoreboard.textContent = `White wins: ${wins.w} | Black wins: ${wins.b}`;
}

function rematchGame(){
  const overlay = document.getElementById("winsPopupOverlay");
  const popup = document.getElementById("winsPopup");
  if(overlay) { overlay.classList.add("hidden"); overlay.style.display = "none"; }
  if(popup){ popup.style.opacity = "0"; popup.style.transform = "scale(0.8)"; }

  turn = "w";
  playerSide = "w";
  gameOver = false;
  selected = null;
  possibleMoves = [];
  promotionSquare = null;

  initBoard();
  updateStatus();

  const scoreboard = document.getElementById("scoreBoard");
  if(scoreboard) scoreboard.textContent = `White wins: ${wins.w} | Black wins: ${wins.b}`;
}

function backToMenu(){
  location.reload();
}
