// const express=require("express")
// const socket = require("socket.io")
// const http=require("http")
// const {Chess}=require("chess.js")
// const path=require("path")

// const app=express()

// const server=http.createServer(app)
// const io=socket(server);

// const chess=new Chess()
// let players={}
// let currentPlayer="w"

// app.set("view engine","ejs")
// app.set("views", path.join(__dirname, "views"));
// app.use(express.static(path.join(__dirname,"public")))

// app.get('/',(req,res)=>{
//     res.render("index")
// })
// io.on("connection",(uniqueSocket)=>{
//     console.log("connected");

//     if(!players.white){
//         players.white=uniqueSocket.id
//         uniqueSocket.emit("playerRole","w")
//     }
//     else if(!players.black){
//         players.black=uniqueSocket.id;
//         uniqueSocket.emit("playerRole","b")
//     }
//     else{
//         uniqueSocket.emit("spectatorRole")
//     }

//     uniqueSocket.on("move",(move)=>{
//         try{
//             if(chess.turn()==='w' && uniqueSocket.id != players.white) return;
//             if(chess.turn()==='b' && uniqueSocket.id != players.black) return;

//             const result=chess.move(move);
//             if(result){
//                 currentPlayer = chess.turn(); 
//                 io.emit("move",move);
//                 io.emit("boardState",chess.fen())
//             }
//             else{
//                 console.log(`Invalid Move ${move}`);
//                 uniqueSocket.emit(`InvalidMove ${move}`)
//             }
//         }catch(err){
//             console.log(err.message);
//             uniqueSocket.emit(`InvalidMove ${move}`)
//         }

//     })
 
//     uniqueSocket.on("disconnect",()=>{
//         if(uniqueSocket.id== players.white ){
//             delete players.white;
//         }
//         else if(uniqueSocket.id==players.black){
//             delete players.black
//         }
//     })
// })

// server.listen(3000,()=>{
//     console.log(`http://localhost:3000`);
// });




const express = require("express")
const { Server } = require("socket.io")
const http = require("http")
const { Chess } = require("chess.js")
const path = require("path")

const app = express()

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: "*", // Be more specific in production
    methods: ["GET", "POST"]
  }
});

const chess = new Chess()
let players = {}
let currentPlayer = "w"

app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")))

app.get('/', (req, res) => {
    res.render("index")
})

io.on("connection", (uniqueSocket) => {
    console.log("Client connected:", uniqueSocket.id);

    if (!players.white) {
        players.white = uniqueSocket.id
        uniqueSocket.emit("playerRole", "w")
    }
    else if (!players.black) {
        players.black = uniqueSocket.id;
        uniqueSocket.emit("playerRole", "b")
    }
    else {
        uniqueSocket.emit("spectatorRole")
    }

    uniqueSocket.on("move", (move) => {
        try {
            if (chess.turn() === 'w' && uniqueSocket.id != players.white) return;
            if (chess.turn() === 'b' && uniqueSocket.id != players.black) return;

            const result = chess.move(move);
            if (result) {
                currentPlayer = chess.turn();
                io.emit("move", move);
                io.emit("boardState", chess.fen())
            }
            else {
                console.log(`Invalid Move ${move}`);
                uniqueSocket.emit("invalidMove", move)
            }
        } catch (err) {
            console.log(err.message);
            uniqueSocket.emit("invalidMove", move)
        }
    })

    uniqueSocket.on("disconnect", () => {
        console.log("Client disconnected:", uniqueSocket.id);
        
        if (uniqueSocket.id == players.white) {
            delete players.white;
        }
        else if (uniqueSocket.id == players.black) {
            delete players.black
        }
    })

    // Add error handling for socket connections
    uniqueSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
    });
})

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});