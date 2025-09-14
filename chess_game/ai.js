function aiMove(){
  if(gameOver || turn !== "b") return;

  const moves = [];

  for(let i=0;i<8;i++){
    for(let j=0;j<8;j++){
      const p = chessBoard[i][j];
      if(p && p === p.toLowerCase()){ 
        const mvs = legalMoves(i,j);
        for(const mv of mvs){
          moves.push({si:i, sj:j, di:mv.i, dj:mv.j});
        }
      }
    }
  }

  if(moves.length === 0){
    gameOver = true;
    wins["w"]++;
    showWinPopup(`${players.w} wins! AI has no moves.`);
    return;
  }

  let chosen;
  if(aiLevel === "easy"){
    chosen = moves[Math.floor(Math.random()*moves.length)];
  } else if(aiLevel === "medium"){
    const captures = moves.filter(m => chessBoard[m.di][m.dj] !== "");
    chosen = captures.length ? captures[Math.floor(Math.random()*captures.length)] : moves[Math.floor(Math.random()*moves.length)];
  } else {
    chosen = bestMove(moves);
  }

  movePiece(chosen.si, chosen.sj, chosen.di, chosen.dj);
}

const pieceValues = { p:1, n:3, b:3, r:5, q:9, k:100 };
function bestMove(moves){
  let best = null;
  let bestScore = -Infinity;
  for(const m of moves){
    const tgt = chessBoard[m.di][m.dj];
    if(tgt){
      const val = pieceValues[tgt.toLowerCase()] || 0;
      if(val > bestScore){ bestScore = val; best = m; }
    }
  }
  return best || moves[Math.floor(Math.random()*moves.length)];
}
