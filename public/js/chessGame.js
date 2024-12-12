
const socket=io()
const chess=new Chess();

const boardElement=document.querySelector(".chessboard")

let draggedPiece=null;
let sourceSquare=null;
let playerRole=null; 

const renderBoard=()=>{
    const board=chess.board();
    boardElement.innerHTML="";
    board.forEach((row,rowIndex)=>{
        row.forEach((square,sqrIndex)=>{
            const sqrElement=document.createElement("div");
            sqrElement.classList.add("square",
                (rowIndex+sqrIndex)%2===0?"light":"dark"
            )
            sqrElement.dataset.row= rowIndex;
            sqrElement.dataset.col=sqrIndex;

            if(square){
                const pieceElement=document.createElement("div")
                pieceElement.classList.add("piece",
                    square.color==="w"?"white":"black"
                )
                pieceElement.innerText= getPieceUniCode(square);
                pieceElement.draggable= playerRole===square.color;

                pieceElement.addEventListener("dragstart",(e)=>{
                    if(pieceElement.draggable){
                        draggedPiece=pieceElement;
                        sourceSquare={row: rowIndex,col: sqrIndex}
                        e.dataTransfer.setData("text/plain","");
                    }
                })
                pieceElement.addEventListener("dragged",(e)=>{
                    draggedPiece=null;
                    sourceSquare=null;
                })
                sqrElement.appendChild(pieceElement)
            }

            sqrElement.addEventListener("dragover",(e)=>{
                e.preventDefault();
            })

            sqrElement.addEventListener("drop",(e)=>{
                e.preventDefault()
                if(draggedPiece){
                    const targetSource={
                        row:parseInt(sqrElement.dataset.row),
                        col:parseInt(sqrElement.dataset.col)
                    }

                    handleMove(sourceSquare,targetSource);
                }
            })
            boardElement.appendChild(sqrElement)
        })
    })  
    if(playerRole==='b'){
        boardElement.classList.add("flipped");
    }
    else{
        boardElement.classList.remove("flipped");

    }
} 
const handleMove=(source,target)=>{
    const move={
        from:`${String.fromCharCode(97+source.col)}${8-source.row}`,
        to:`${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion:'q'
    }
    socket.emit("move",move)
}
const getPieceUniCode=(piece)=>{
    const unicodePieces = {
        p:  "♟", 
        r: "♜", 
        n: "♞", 
        b: "♝", 
        q: "♛", 
        k: "♚", 
        P: "♙", 
        R: "♖", 
        N: "♘", 
        B: "♗", 
        Q: "♕", 
        K: "♔"  
    };
    return unicodePieces[piece.color === 'w' ? piece.type.toUpperCase() : piece.type] || ""
}

socket.on("playerRole",(role)=>{
    playerRole=role;
    renderBoard();
})
socket.on("spectatorRole",(role)=>{
    playerRole=null;
    renderBoard();
})
socket.on("boardState",(fen)=>{
    chess.load(fen)
    renderBoard()
})
socket.on("move",(move)=>{
    chess.move(move);
    renderBoard()
})
renderBoard();