const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

const fs = require("fs")
var amministratore = 0
var allClients = [];
var nicks = "";

let cartelle = JSON.parse(fs.readFileSync("./cartelle.json", "utf-8"))

let colori = []
for (let c = 0; c < 6; c++)for (let d = 0; d < 6; d++)colori.push(c)

let estratti = []
let palline = []

for (let r = 0; r < 90; r++) palline.push(r + 1)
let rimasti = [...palline]

app.use(express.static('./public'));

app.get("/reboot", (req, res) => {

    process.exit(1)
})
var numero = 0

var activeClients = 0;
var maxClients = 10;

maxClients = 100;
var status = -2

console.log("started")


io.sockets.on('connection', function (socket) {


    if (status > -1) { socket.disconnect(); return }

    numero++
    console.log("connesso!! ", numero)
    if (activeClients < maxClients) {
        allClients.push(socket);

        activeClients += 1;

        socket.emit('numero', numero);

        socket.on('disconnect', function () {
            activeClients -= 1;
            var i = allClients.indexOf(socket);
            io.sockets.emit('andato', socket.nickname);
            io.sockets.emit('message', { clients: activeClients });
            delete allClients[i];
        });

        socket.on('chiama', function (msg) {


            io.sockets.emit("combinaz", { comb: msg, nick: socket.nickname });


            socket.vincite.push(msg.charAt(0))

            //Verifica combinazione


        });


        socket.on('compra', function (msg) {

            io.sockets.emit('comprato', msg);

            comprataCartella(msg.cartella, msg.mynumber, socket)
        });


        socket.on('via', function (msg) {

            status++
            allClients.forEach(function (s) {
                s.emit('start', status);

            });


        });

        socket.on('estrai', function () {

            let pallina = casuale(rimasti.length)

            let estratta = rimasti.splice(pallina, 1)[0]

            estratti.push(pallina)

            allClients.forEach(function (s) {
                s.emit('estratta', estratta);
            });
        });

        socket.on('tabella', function () {

            let strh = "<table class='tbl'>"
            strh += "<tr><th>nome</th> <th>cartelle</th><th>id</th> <th>vincite</th><th>ip</th>  "
            allClients.forEach(function (s,idx) {
                strh += "<tr>"
                strh += "<td>" + s.nickname + "</td>"
                strh += "<td>" + Math.floor(s.cartelle.length / 27) + "</td>"
                strh += "<td>" + s.id + "</td>"
                strh += "<td>" + s.vincite + "</td>"
                strh += "<td>" + s.ip + "</td>"

                strh += "<td><button onclick='disconn("+idx+")'>Disconnetti</button></td>"
            });
            strh += "</table>"

            socket.emit('tabhtml', strh)

        });

        socket.on('disconnetti', function (msg) {

            console.log(msg)

         allClients[msg].disconnect()


        });



        socket.on('regolamento', function (msg) {

            allClients.forEach(function (s) {
                s.emit('regolamento', msg);
            });
            status = -1
            allClients.forEach(function (s) {
                s.emit('cartelle', { cartelle: cartelle, colori: colori });
            });


        });

        socket.on('join', function (msg) {

            socket.nickname = msg;
            socket.cartelle = []
            socket.colori = []
            socket.vincite = []
            socket.ip=socket.conn.remoteAddress
            if (amministratore == 0) { amministratore = 1; socket.amministratore = socket.nickname; socket.emit("amministratore", 1) }


            nicks = "";

            allClients.forEach(function (s) {
                nicks += s.nickname + "-";
            });
            io.sockets.emit('lista', nicks);

            if (activeClients == maxClients) {
                var nn = 1;
                io.sockets.clients().forEach(function (s) {
                    s.emit('start', nn++);
                });
            }
        });
    }
});

function comprataCartella(numCartella, numGioc, sck) {


    let comprata = cartelle.splice(numCartella * 27, 27)
    let colore = colori.splice(numCartella, 1)[0]

    sck.cartelle = [...sck.cartelle, ...comprata]
    sck.colori.push(colore)

    io.sockets.emit('cartelle', { cartelle: cartelle, colori: colori });
    sck.emit('comprate', { cartelle: sck.cartelle, colori: sck.colori });


}

function casuale(n) { return Math.floor(n * Math.random()) }


const port = process.env.PORT || 8040;


httpServer.listen(port);

console.log("Server in ascolto alla porta " + port);