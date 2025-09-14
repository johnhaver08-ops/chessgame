let chessBoard = [];
let selectedSquare = null;
let possibleMoves = [];
let turn = "w";
let gameOver = false;

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
  renderBoard();
  updateStatus();
}

function renderBoard(){
  const boardEl = document.getElementById("board");
  boardEl.innerHTML = "";
  for(let r=0;r<8;r++){
    for(let c=0;c<8;c++){
      const square = document.createElement("div");
      square.classList.add("square");
      square.classList.add((r+c)%2===0?"light":"dark");
      square.dataset.row = r;
      square.dataset.col = c;
      let piece = chessBoard[r][c];
      if(piece){
        square.textContent = piece;
      }
      square.addEventListener("click",()=>handleSquareClick(r,c));
      boardEl.appendChild(square);
    }
  }
}

function handleSquareClick(r,c){
  if(gameOver) return;

  const piece = chessBoard[r][c];
  if(selectedSquare){
    if(isValidMove(selectedSquare.r, selectedSquare.c, r, c)){
      movePiece(selectedSquare.r, selectedSquare.c, r, c);
      switchTurn();
      renderBoard();
    }
    selectedSquare = null;
    possibleMoves = [];
  } else {
    if((turn==="w" && piece === piece.toUpperCase() && piece!=="") ||
       (turn==="b" && piece === piece.toLowerCase() && piece!=="")){
      selectedSquare = {r,c};
      possibleMoves = getPossibleMoves(r,c);
    }
  }
}

function movePiece(r1,c1,r2,c2){
  chessBoard[r2][c2] = chessBoard[r1][c1];
  chessBoard[r1][c1] = "";
}

function getPossibleMoves(r,c){
  let moves = [];
  if(chessBoard[r][c].toLowerCase() === "p"){
    let dir = chessBoard[r][c] === "P" ? -1 : 1;
    if(r+dir>=0 && r+dir<8 && chessBoard[r+dir][c] === ""){
      moves.push({r:r+dir,c:c});
    }
  }
  return moves;
}

function switchTurn(){
  turn = (turn === "w" ? "b" : "w");
  updateStatus();

  if(mode === "pve" && turn === "b" && !gameOver){
    setTimeout(()=>{
      aiMove(aiLevel);
      switchTurn();
      renderBoard();
    }, 500);
  }
}

function updateStatus(){
  const turnBox = document.getElementById("turnBox");
  if(turnBox){
    turnBox.innerText = (turn==="w" ? "White's Turn" : "Black's Turn");
  }
}
