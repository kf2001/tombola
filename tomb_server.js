const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

const fs = require("fs")
var amministratore = 0
var password = "olop"
var joins = "1010"
var allClients = [];
var ips = []
var sockamm = {}
var combfatte = [false, false, false, false, false, false]

let cartelle = JSON.parse(fs.readFileSync("./cartelle.json", "utf-8"))

let colori = []
for (let c = 0; c < 6; c++)for (let d = 0; d < 6; d++)colori.push(c)

let estratti = []
let palline = []
let vincstr = ["a", "t", "q", "c", "T", "Z"]

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
var premi = [1, 2, 3, 4, 10, 5]
var regolam = {}

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


            if (combfatte[status] == false) {
                io.sockets.emit("combinaz", { comb: msg, nick: socket.nickname });

                socket.vincite += vincstr[status]


                if (regolam.vincunico == true) combfatte[status] = true

            }

            //Verifica combinazione


        });


        socket.on('compra', function (msg) {

            io.sockets.emit('comprato', msg);

            comprataCartella(msg.cartella, msg.mynumber, socket)
        });


        socket.on('via', function (msg) {

            if (socket.id != sockamm.id) return;


            status++

            if (status < 6) io.sockets.emit('start', status);

            else {
                let msgp = calcolaPremi()
                let tabh = tabpremi()
                io.sockets.emit('premi', tabh);
            }


        });

        socket.on('miecartelle', function (msg) {

            socket.emit('miecartelle', { cartelle: socket.cartelle, colori: socket.colori });


        });
        socket.on('tuttecartelle', function (msg) {

            socket.emit('tuttecartelle', { cartelle: cartelle, colori: colori });


        });

        socket.on('estrai', function () {

            if (socket.id != sockamm.id) return;


            let pallina = casuale(rimasti.length)

            let estratta = rimasti.splice(pallina, 1)[0]

            estratti.push(pallina)

            allClients.forEach(function (s) {
                s.emit('estratta', estratta);
            });
        });

        socket.on('tabella', function () {

            let strh = "<table class='tbl'>"
            strh += "<tr><th>nome</th> <th>cartelle</th><th>id</th> <th>vincite</th><th>ip</th><th>chat</th>  "
            allClients.forEach(function (s, idx) {
                strh += "<tr>"
                strh += "<td>" + s.nickname + "</td>"
                strh += "<td>" + Math.floor(s.cartelle.length / 27) + "</td>"
                strh += "<td>" + s.id.substr(0, 5) + "</td>"
                strh += "<td>" + s.vincite + "</td>"
                strh += "<td>" + s.ip.replace(/f/g, "").replace(/:/g, ""); + "</td>"
                strh += "<td>" + s.chatenable + "</td>"


                strh += "<td><button onclick='disconn(" + idx + ")'>Disconnetti</button></td>"
                strh += "<td><button onclick='chat(" + idx + ")'>Toggle chat</button></td>"
                strh += "<td><button onclick='cartgioc(" + idx + ")'>Cartelle</button></td>"
            });
            strh += "</table>"

            socket.emit('tabhtml', strh)

        });

        socket.on('chiedidisconn', function (msg) {

            if (socket.id != sockamm.id) return;
            allClients[msg].disconnect()

        });
        socket.on('togglechat', function (msg) {

            if (socket.id != sockamm.id) return;
            allClients[msg].chatenable = !allClients[msg].chatenable


        });
        socket.on('chiedicartelle', function (msg) {


            if (socket.id != sockamm.id) return;

            let sck = allClients[msg]

            socket.emit('cartellegioc', { cartelle: sck.cartelle, colori: sck.colori, fagioli: sck.fagioli });

        });



        socket.on('fagioli', function (msg) {

            socket.fagioli = [...msg]

        });

        socket.on('regolamento', function (msg) {

            if (socket.id != sockamm.id) return;

            allClients.forEach(function (s) {
                s.emit('regolamento', msg);
            });

            regolam = msg;
            console.log(regolam)
            status = -1

        });

        socket.on('join', function (msg) {

            socket.nickname = msg.nick;
            socket.pwwd = msg.pwd;
            socket.joins = msg.join
            socket.cartelle = []
            socket.fagioli = new Array(36 * 27).fill(0);
            socket.colori = []
            socket.chatenable = true
            socket.vincite = ""
            socket.guadagno = 0
            socket.ip = socket.conn.remoteAddress

            if (ips.indexOf(socket.ip) > -1 && regolam.ipmult == false) socket.disconnect(); else {


                ips.push(socket.ip)

                if (amministratore == 0) {

                    if (msg.pwd != password) { socket.disconnect(); return; }
                    amministratore = 1;
                    socket.amministratore = socket.nickname;
                    joins = socket.joins; sockamm = socket;
                    socket.emit("amministratore", 1);

                } else {

                    console.log(socket.joins, joins)
                    if (socket.joins != joins) socket.disconnect();


                }




            }


        });
    }
});

function comprataCartella(numCartella, numGioc, sck) {


    let comprata = cartelle.splice(numCartella * 27, 27)
    let colore = colori.splice(numCartella, 1)[0]

    sck.cartelle = [...sck.cartelle, ...comprata]
    sck.colori.push(colore)

    io.sockets.emit('tuttecartelle', { cartelle: cartelle, colori: colori });
    sck.emit('miecartelle', { cartelle: sck.cartelle, colori: sck.colori });


}

function calcolaPremi() {

    let piatto = 0
    let fatti = [1, 1, 1, 1, 1, 1]
    let premi_ = []

    allClients.forEach(function (s) {


        piatto += Math.floor(s.cartelle.length / 27) * (regolam.prezzo * 1);
        for (let v = 0; v < 6; v++)
            if (s.vincite.indexOf(vincstr[v]) > -1) fatti[v]++
    });


    let valore = [0, 0, 0, 0, 0, 0]
    for (let v = 0; v < 6; v++)
        valore[v] = premi[v] * piatto / fatti[v]

    console.log(3, valore)
    allClients.forEach(function (s) {
        let guad = 0
        for (let v = 0; v < 6; v++)
            if (s.vincite.indexOf(vincstr[v]) > -1) guad += valore[v]

        s.guadagno = guad
        console.log(2, guad)

        let prem = { nick: s.nickname, vinto: s.guadagno }
        premi_.push(prem)

    });


    return premi_

}

function tabpremi() {

    let strh = "<table class='tbl'>"
    strh += "<tr><th>nome</th> <th>cartelle</th> <th>tomb</th><th>vincita</th>  "
    allClients.forEach(function (s, idx) {
        strh += "<tr>"
        strh += "<td>" + s.nickname + "</td>"
        strh += "<td>" + Math.floor(s.cartelle.length / 27) + "</td>"
        strh += "<td>" + s.vincite + "</td>"
        strh += "<td>" + s.guadagno + "</td>"


    });
    strh += "</table>"

    return strh



}

function casuale(n) { return Math.floor(n * Math.random()) }

let portc = casuale(50) + 8040
const port = process.env.PORT || portc;


httpServer.listen(portc);

console.log("Server in ascolto alla porta " + port);