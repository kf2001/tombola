const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

const fs = require("fs")
var amministratore = []

var joins = "1010"
var allClients = [];
var ips = []
var sockamm = []
var rooms = []


var status = []


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


var maxClients = 1000;

var premi = [1, 2, 3, 4, 10, 5]


console.log("started")


io.sockets.on('connection', function (socket) {


    //  if (status > -1) { socket.disconnect(); return }

    numero++
    console.log("connesso!! ", numero)
    if (activeClients < maxClients) {
        allClients.push(socket);

        activeClients += 1;

        socket.emit('numero', numero);

        socket.on('disconnect', function () {
            activeClients -= 1;
            var i = allClients.indexOf(socket);
            io.sockets.to(socket.room).emit('andato', socket.nickname);
            //    io.socketss.emit('message', { clients: activeClients });
            if (socket.amministratore == 1) {

                let roomc = allClients.filter(c => c.room == socket.room)
                console.log(roomc.length)
                roomc.forEach(s => s.disconnect())

            }
            delete allClients[i];
            console.log("rimasti ", allClients.length)
        });

        socket.on('chiama', function (msg) {


            if (socket.sockamm.combfatte[status[socket.room]] == false) {
                io.sockets.in(socket.room).emit("combinaz", { comb: msg, nick: socket.nickname });

                socket.vincite += vincstr[status[socket.room]]


                if (socket.sockamm.regolam.vincunico == true) socket.sockamm.combfatte[status[socket.room]] = true

            }

            //Verifica combinazione


        });


        socket.on('compra', function (msg) {

            io.sockets.in(socket.room).emit('comprato', msg);

            comprataCartella(msg.cartella, msg.mynumber, socket)
        });


        socket.on('via', function (msg) {

            if (socket.id != socket.sockamm.id) return;

            status[socket.room]++

            if (status[socket.room] < 6) io.sockets.in(socket.room).emit('start', status[socket.room]);

            else {
                let msgp = calcolaPremi(socket)
                let tabh = tabpremi()
                io.sockets.in(socket.room).emit('premi', tabh);
            }


        });

        socket.on('miecartelle', function (msg) {


            socket.emit('miecartelle', { cartelle: socket.cartelle, colori: socket.colori });


        });
        socket.on('tuttecartelle', function (msg) {



            io.sockets.in(socket.room).emit('tuttecartelle', { cartelle: socket.sockamm.tuttecartelle, colori: socket.sockamm.tutticolori });


        });

        socket.on('estrai', function () {

            if (socket.id != socket.sockamm.id) return;


            let pallina = casuale(rimasti.length)

            let estratta = rimasti.splice(pallina, 1)[0]

            estratti.push(pallina)

            //   allClients.forEach(function (s) {
            io.sockets.in(socket.room).emit('estratta', estratta);
            //  });
        });

        socket.on('tabella', function () {

            let strh = "<table class='tbl'>"
            strh += "<tr><th>nome</th> <th>cartelle</th><th>id</th> <th>vincite</th><th>ip</th><th>chat</th>  "
            allClients.filter(x => x.room == socket.room).forEach(function (s, idx) {
                strh += "<tr>"
                strh += "<td>" + s.nickname + "</td>"
                strh += "<td>" + Math.floor(s.cartelle.length / 27) + "</td>"
                strh += "<td>" + s.id.substr(0, 5) + "</td>"
                strh += "<td>" + s.vincite + "</td>"
                strh += "<td>" + s.ip.replace(/f/g, "").replace(/:/g, ""); + "</td>"
                strh += "<td>" + s.chatenable + "</td>"


                strh += "<td><button onclick=\"disconn('" + s.id + "')\">Disconnetti</button></td>"
                strh += "<td><button onclick=\"chat('" + s.id + "')\">Toggle chat</button></td>"
                strh += "<td><button onclick=\"cartgioc('" + s.id + "')\">Cartelle</button></td>"
            });
            strh += "</table>"

            socket.emit('tabhtml', strh)

        });

        socket.on('chiedidisconn', function (msg) {

            if (socket.id != socket.sockamm.id) return;
            allClients.filter(c => c.id == msg)[0].disconnect()

        });
        socket.on('togglechat', function (msg) {

            if (socket.id != socket.sockamm.id) return;

            let cli = allClients.filter(c => c.id == msg)[0]
            // da modificare
            cli.chatenable = !cli.chatenable


        });
        socket.on('chiedicartelle', function (msg) {


            if (socket.id != socket.sockamm.id) return;

            let sck = allClients.filter(c => c.id == msg)[0]

            socket.emit('cartellegioc', { cartelle: sck.cartelle, colori: sck.colori, fagioli: sck.fagioli });

        });



        socket.on('fagioli', function (msg) {

            socket.fagioli = [...msg]

        });

        socket.on('regolamento', function (msg) {

            console.log(888)
            if (socket.id != socket.sockamm.id) return;


            io.sockets.in(socket.room).emit('regolamento', msg);


            socket.regolam = msg;

            status[socket.room] = -1

        });

        socket.on('join', function (msg) {

            socket.nickname = msg.nick;

            socket.joins = msg.room
            socket.cartelle = []
            socket.fagioli = new Array(36 * 27).fill(0);
            socket.colori = []
            socket.chatenable = true
            socket.vincite = ""
            socket.guadagno = 0
            socket.ip = socket.conn.remoteAddress

            ips.push(socket.ip)

            if (msg.amministratore == "1") {

                let room = socket.joins
                amministratore[room] = 1;
                socket.amministratore = 1
                socket.amministratore = socket.nickname;
                socket.room = room
                sockamm[room] = socket;
                socket.sockamm = socket
                socket.ips = []
                status[socket.room] = -2
                socket.combfatte = [false, false, false, false, false, false]

                rooms.push(room)
                socket.join(room)
                socket.emit("amministratore", 1);

                socket.tuttecartelle = JSON.parse(fs.readFileSync("./cartelle.json", "utf-8"))


                let colori = []
                for (let c = 0; c < 6; c++)for (let d = 0; d < 6; d++)colori.push(c)
                socket.tutticolori = colori
                socket.estratti = []

                let palline = []


                for (let r = 0; r < 90; r++) palline.push(r + 1)

                socket.palline = [...palline]
                socket.rimasti = [...palline]
                socket.regolam = {}


                console.log("ammm")
                console.log(rooms)

            } else {

                if (rooms.indexOf(socket.joins) < 0) socket.disconnect();

                socket.amministratore = 0

                socket.sockamm = sockamm[socket.joins]
                socket.room = socket.joins
                socket.join(socket.joins)
                if (socket.sockamm.ips.indexOf(socket.ip) > -1 && socket.sockamm.regolam.ipmult == false) socket.disconnect();
                socket.sockamm.ips.push(socket.ip)


            }




        });
    }
});

function comprataCartella(numCartella, numGioc, sck) {


    let comprata = sck.sockamm.tuttecartelle.splice(numCartella * 27, 27)
    let colore = sck.sockamm.tutticolori.splice(numCartella, 1)[0]

    sck.cartelle = [...sck.cartelle, ...comprata]
    sck.colori.push(colore)

    io.sockets.in(sck.room).emit('tuttecartelle', { cartelle: sck.sockamm.tuttecartelle, colori: sck.sockamm.tutticolori });
    sck.emit('miecartelle', { cartelle: sck.cartelle, colori: sck.colori });


}

function calcolaPremi(sck) {

    let piatto = 0
    let fatti = [0, 0, 0, 0, 0, 0]
    let premi_ = []


    let clients= allClients.filter(c=>c.room==sck.room)

    clients.forEach(function (s) {


        piatto += Math.floor(s.cartelle.length / 27) * (sck.regolam.prezzo * 1);
        for (let v = 0; v < 6; v++)
            if (s.vincite.indexOf(vincstr[v]) > -1) fatti[v]++
    });


    let valore = [0, 0, 0, 0, 0, 0]
    for (let v = 0; v < 6; v++)
        valore[v] = premi[v] * piatto / fatti[v]

  
    clients.forEach(function (s) {
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