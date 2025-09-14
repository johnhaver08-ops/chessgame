let chessBoard = [];
let turn = "w";
let selected = null;
let possibleMoves = [];
let gameOver = false;
let players = { w: "White", b: "Black" };
let playerSide = "w";
let wins = { w: 0, b: 0 };
let showMoves = true;
let promotionSquare = null;

function inBounds(i,j){ return i>=0 && i<8 && j>=0 && j<8; }
function isOpposite(piece, target){
  if(!piece || !target) return false;
  return (piece === piece.toUpperCase() && target === target.toLowerCase()) ||
         (piece === piece.toLowerCase() && target === target.toUpperCase());
}
function isEmptySquare(i,j){
  return !chessBoard[i][j];
}

function initBoard(){
  chessBoard = [
    ["r","n","b","q","k","b","n","r"],
    ["p","p","p","p","p","p","p","p"],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["","","","","","","",""],
    ["P","P","P","P","P","P","P","P"],
    ["R","N","B","Q","K","B","N","R"]
  ];
  gameOver = false;
  selected = null;
  possibleMoves = [];
  promotionSquare = null;
  document.getElementById("promotionPopup").style.display = "none";
  renderBoard();
}

function renderBoard(){
  const board = document.getElementById("board");
  if(!board) return;
  board.innerHTML = "";

  for(let i=0;i<8;i++){
    for(let j=0;j<8;j++){
      const square = document.createElement("div");
      square.className = "square " + ((i+j)%2===0 ? "light" : "dark");
      square.dataset.i = i; square.dataset.j = j;

      if(selected && selected.i===i && selected.j===j){
        square.classList.add("selected");
      }

      const p = chessBoard[i][j];
      if(p) square.textContent = pieceToChar(p);

      square.onclick = ()=> handleClick(i,j);
      board.appendChild(square);
    }
  }

  if(showMoves){
    for(let mv of possibleMoves){
      const idx = mv.i*8 + mv.j;
      const square = board.children[idx];
      if(square){
        const dot = document.createElement("div");
        dot.className = "dot";
        square.appendChild(dot);
      }
    }
  }

  updateStatus();
}

function pieceToChar(p){
  const mapping = {
    p:"♟", r:"♜", n:"♞", b:"♝", q:"♛", k:"♚",
    P:"♙", R:"♖", N:"♘", B:"♗", Q:"♕", K:"♔"
  };
  return mapping[p] || "";
}

function toggleMoves(){
  showMoves = !showMoves;
  const btn = document.getElementById("toggleMovesBtn");
  if(btn) btn.textContent = showMoves ? "Hide Moves" : "Show Moves";
  renderBoard();
}

function handleClick(i,j){
  if(gameOver) return;

  const p = chessBoard[i][j];
  if(selected && possibleMoves.some(m => m.i===i && m.j===j)){
    movePiece(selected.i, selected.j, i, j);
    selected = null; possibleMoves = [];
  } else if(p && ((turn==="w" && p === p.toUpperCase()) || (turn==="b" && p === p.toLowerCase()))){
    selected = {i,j};
    possibleMoves = legalMoves(i,j);
  } else {
    selected = null; possibleMoves = [];
  }

  renderBoard();
}

function movePiece(si,sj,di,dj,silent=false){
  const piece = chessBoard[si][sj];
  const target = chessBoard[di][dj];
  chessBoard[di][dj] = piece;
  chessBoard[si][sj] = "";

  if(target && target.toLowerCase() === "k"){
    gameOver = true;
    const winnerKey = turn; 
    const winnerName = players[winnerKey];
    wins[winnerKey]++;
    showWinPopup(`${winnerName} Wins!`);
    return;
  }

  if(piece === "P" && di === 0){
    promotionSquare = {i:di, j:dj, color:"w"};
    document.getElementById("promotionPopup").style.display = "flex";
    renderBoard();
    return;
  }
  if(piece === "p" && di === 7){
    promotionSquare = {i:di, j:dj, color:"b"};
    document.getElementById("promotionPopup").style.display = "flex";
    renderBoard();
    return;
  }

  if(!silent && !gameOver){
    turn = (turn === "w" ? "b" : "w");
    renderBoard();

    if(typeof mode !== "undefined" && mode === "pve" && turn !== playerSide && !gameOver){
      setTimeout(aiMove, 300);
    }
  }
}

function legalMoves(i,j){
  const moves = [];
  const piece = chessBoard[i][j];
  if(!piece) return moves;
  const isWhite = piece === piece.toUpperCase();
  const dir = isWhite ? -1 : 1;

  function tryAdd(ni,nj){
    if(!inBounds(ni,nj)) return;
    const target = chessBoard[ni][nj];
    if(!target || isOpposite(piece, target)){
      moves.push({i:ni, j:nj});
    }
  }

  switch(piece.toLowerCase()){
    case "p": {
      const f = i + dir;
      if(inBounds(f, j) && isEmptySquare(f, j)) tryAdd(f, j);
      const startRank = isWhite ? 6 : 1;
      const f2 = i + 2*dir;
      if(i === startRank && inBounds(f2, j) && isEmptySquare(f, j) && isEmptySquare(f2, j)) tryAdd(f2, j);
      for(let dj of [-1,1]){
        const ni = f, nj = j + dj;
        if(inBounds(ni,nj)){
          const target = chessBoard[ni][nj];
          if(target && isOpposite(piece, target)){
            moves.push({i:ni, j:nj});
          }
        }
      }
      break;
    }
    case "r": rookMoves(i,j,moves); break;
    case "n": knightMoves(i,j,moves); break;
    case "b": bishopMoves(i,j,moves); break;
    case "q": rookMoves(i,j,moves); bishopMoves(i,j,moves); break;
    case "k":
      for(let dx=-1; dx<=1; dx++){
        for(let dy=-1; dy<=1; dy++){
          if(dx===0 && dy===0) continue;
          const ni = i+dx, nj = j+dy;
          if(inBounds(ni,nj)){
            const target = chessBoard[ni][nj];
            if(!target || isOpposite(piece, target)){
              moves.push({i:ni, j:nj});
            }
          }
        }
      }
      break;
  }
  return moves;
}

function rookMoves(i,j,moves){
  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  slideMoves(i,j,dirs,moves);
}
function bishopMoves(i,j,moves){
  const dirs = [[1,1],[1,-1],[-1,1],[-1,-1]];
  slideMoves(i,j,dirs,moves);
}
function knightMoves(i,j,moves){
  const steps = [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]];
  const piece = chessBoard[i][j];
  for(let [dx,dy] of steps){
    const ni = i+dx, nj = j+dy;
    if(inBounds(ni,nj)){
      const target = chessBoard[ni][nj];
      if(!target || isOpposite(piece, target)){
        moves.push({i:ni, j:nj});
      }
    }
  }
}
function slideMoves(i,j,dirs,moves){
  const piece = chessBoard[i][j];
  for(let [dx,dy] of dirs){
    let ni = i+dx, nj = j+dy;
    while(inBounds(ni,nj)){
      const target = chessBoard[ni][nj];
      if(!target){
        moves.push({i:ni, j:nj});
      } else {
        if(isOpposite(piece, target)){
          moves.push({i:ni, j:nj});
        }
        break;
      }
      ni += dx; nj += dy;
    }
  }
}

function promote(pieceChar){
  if(!promotionSquare) return;
  const {i,j,color} = promotionSquare;
  chessBoard[i][j] = (color === "w") ? pieceChar.toUpperCase() : pieceChar.toLowerCase();
  promotionSquare = null;
  document.getElementById("promotionPopup").style.display = "none";

  turn = (turn === "w" ? "b" : "w");
  renderBoard();

  if(typeof mode !== "undefined" && mode === "pve" && turn !== playerSide && !gameOver){
    setTimeout(aiMove, 300);
  }
}

function showWinPopup(message){
  const winnerText = document.getElementById("winnerText");
  const scoreboard = document.getElementById("scoreBoard");
  const overlay = document.getElementById("winsPopupOverlay");
  const popup = document.getElementById("winsPopup");

  let winnerClass = "";
  if(message.toLowerCase().includes("white")) winnerClass = "winner-white";
  if(message.toLowerCase().includes("black")) winnerClass = "winner-black";

  if(winnerText) {
    winnerText.innerHTML = `<span class="trophy">🏆</span><br><span class="${winnerClass}">${message}</span>`;
  }
  if(scoreboard) scoreboard.textContent = `White wins: ${wins.w} | Black wins: ${wins.b}`;
  if(overlay){
    overlay.classList.remove("hidden");
    overlay.classList.add("show");
    overlay.style.display = "flex";
  }

  setTimeout(()=> {
    popup.style.opacity = "1";
    popup.style.transform = "scale(1)";
  }, 10);

  const status = document.getElementById("statusBar");
  if(status) status.textContent = "Game Over!";
}
