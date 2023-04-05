const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const md5_ = require("./md5.js").md5
const httpServer = createServer(app);
const io = new Server(httpServer, { /* options */ });

const fs = require("fs")
var amministratore = []

var allClients = [];
var ips = []
var sockamm = []
var rooms = []

var status = []
var deus = undefined;


let colori = []
for (let c = 0; c < 6; c++) colori.push(c)

let vincstr = ["a", "t", "q", "c", "T", "Z"]
let lblvia = ["Chiudi iscrizioni", "Via", "Avanti", "Avanti", "Avanti", "Avanti", "Avanti", "Riepilogo"]

app.use(express.static('./public'));

app.get('/', function (req, res) {
    res.redirect('/tomb.html');
});

app.get("/reboot", (req, res) => {

    process.exit(1)
})


var numero = 0

var activeClients = 0;


var maxClients = 1000;

// var premi = [1, 2, 3, 4, 10, 5]


console.log("started")


io.sockets.on('connection', function (socket) {



    numero++
    console.log("connesso!!", numero)
    if (allClients.length < maxClients) {

        console.log("allClients ", allClients.length)
        //  allClients.push(socket);

        //  activeClients += 1;

        socket.emit('numero', numero);

        socket.on('disconnect', function () {



            var i = allClients.indexOf(socket);
            io.sockets.to(socket.room).emit('andato', socket.nickname);
            //    io.socketss.emit('message', { clients: activeClients });
            if (socket.amministratore == 1) {

                let roomc = allClients.filter(c => c.room == socket.room)

                roomc.forEach(s => s.disconnect())

            }
            delete allClients[i];

        });

        socket.on('chiama', function (msg) {


            let comb = status[socket.room] * 1 + 2

            if (verifica(comb, socket)) {


                if (socket.sockamm.combfatte[status[socket.room]] == false) {

                    socket.sockamm.vincitori++
                    io.sockets.in(socket.room).emit("combinaz", { comb: msg, nick: socket.nickname, primo: socket.sockamm.vincitori });

                    socket.vincite += vincstr[status[socket.room]]


                    if (socket.sockamm.regolam.vincunico == true) socket.sockamm.combfatte[status[socket.room]] = true

                }
            }

        });

        socket.on('monitor', function (msg) {


            if (!deus) return;

            if (socket.id != deus.id) return;

            let strm = monitor()
            let strstanze = stanze()


            socket.emit("monitor", { strm: strm, stanze: strstanze })


        });


        socket.on('accetto', function (msg) {


        });

        socket.on('rifiuto', function (msg) {

            socket.disconnect()

        });

        socket.on('compra', function (msg) {

            io.sockets.in(socket.room).emit('comprato', msg);

            comprataCartella(msg.cartella, msg.mynumber, socket)
        });


        socket.on('via', function (msg) {



            if (socket.id != socket.sockamm.id) return;

            status[socket.room]++
            socket.vincitori = 0


            if (status[socket.room] < 6) io.sockets.in(socket.room).emit('start', status[socket.room]);

            else {
                let msgp = calcolaPremi(socket)

                io.sockets.in(socket.room).emit('premi', msgp);
            }


        });

        socket.on('chatm', function (msg) {

            //sanitize !!!
            msg.messaggio = sanitizeInput(msg.messaggio).trim().substr(0, 22)


            if (socket.chatenable)

                io.sockets.in(socket.room).emit('chatm', msg);


        });

        socket.on('miecartelle', function (msg) {


            socket.emit('miecartelle', { cartelle: socket.cartelle, colori: socket.colori });


        });
        socket.on('tuttecartelle', function (msg) {

            if (socket.id != socket.sockamm.id) return;

            io.sockets.in(socket.room).emit('tuttecartelle', { cartelle: socket.sockamm.tuttecartelle, colori: socket.sockamm.tutticolori });
            status[socket.room] = -1

        });

        socket.on('estrai', function () {



            if (socket.id != socket.sockamm.id) return;


            let pallina = casuale(socket.rimasti.length)

            let estratta = socket.rimasti.splice(pallina, 1)[0]

            socket.estratti.push(pallina)

            //   allClients.forEach(function (s) {
            io.sockets.in(socket.room).emit('estratta', estratta);
            //  });
        });

        socket.on('tabella', function () {

      //      let manc=mancanti()

            let strh = "<table class='tbl'>"
            strh += "<tr><th>nome</th> <th>cartelle</th><th>id</th> <th>vincite</th><th>ip</th><th>chat</th>  "
            allClients.filter(x => x.room == socket.room).forEach(function (s, idx) {
             //   let manc=mancanti(s)
                strh += "<tr>"
                strh += "<td>" + s.nickname + "</td>"
                strh += "<td>" + Math.floor(s.cartelle.length / 27) + "</td>"
                strh += "<td>" + s.id.substr(0, 5) + "</td>"
                strh += "<td>" + s.vincite + "</td>"
                strh += "<td>" + s.ip.replace(/f/g, "").replace(/:/g, ""); + "</td>"
                strh += "<td>" + s.chatenable + "</td>"
           //     strh += "<td>" + mancanti.join("-") + "</td>"


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


            if (socket.id != socket.sockamm.id) return;


            // io.sockets.in(socket.room).emit('regolamento', msg);


            socket.regolam = msg;

            status[socket.room] = -1

        });


        socket.on('setregolamento', function (msg) {

            if (socket.id != socket.sockamm.id) return;

            socket.regolam = msg

            console.log(socket.regolam)
            console.log("quiiiii")


        });



        socket.on('join', function (msg) {

            if (msg.deus) {

                if ((md5_(msg.nick)).substr(0, 5) != "44082") return

                deus = socket

                socket.emit("loggato", {})
                return
            }



            allClients.push(socket);


            socket.nickname = msg.nick;

            socket.joins = msg.room
            socket.cartelle = []
            socket.fagioli = new Array(36 * 27).fill(0);

            socket.colori = []
            socket.rbruc = new Array(20).fill(0)
            socket.tbruc = new Array(12).fill(0)

            socket.chatenable = true
            socket.vincite = ""
            socket.guadagno = 0
            socket.vinti = 0
            socket.pagati
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
                socket.vincitori = 0

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

            } else {

                if (rooms.indexOf(socket.joins) < 0) { socket.disconnect(); return; }

                socket.amministratore = 0

                socket.sockamm = sockamm[socket.joins]
                socket.room = socket.joins
                socket.join(socket.joins)

                socket.sockamm.in(socket.room).emit('regolamento', socket.sockamm.regolam);


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

    let premi = [sck.regolam.ambo, sck.regolam.terno, sck.regolam.quaterna, sck.regolam.cinquina, sck.regolam.tombola, sck.regolam.tombolino]


    let sump = premi.reduce((a, b) => a + b, 0);

    let clients = allClients.filter(c => c.room == sck.room)

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

        s.vinto = arrotonda(guad / sump, 2);
        s.pagato = Math.floor(s.cartelle.length / 27) * sck.regolam.prezzo
        s.guadagnato = arrotonda(s.vinto - s.pagato, 2)

        let prem = { nick: s.nickname, vincite: s.vincite, vinto: s.vinto, pagato: s.pagato, guadagnato: s.guadagnato }
        premi_.push(prem)

    });


    return premi_

}



function monitor() {

    let aC = allClients

    let strh = "<table class='tbl'>"
    strh += "<tr><th>nome</th> <th> ammin.</th> <th>cartelle</th> <th>tomb</th><th>room</th>  "

    aC.forEach(s => {
        strh += "<tr>"
        strh += "<td>" + s.nickname + "</td>"

        strh += "<td>" + s.amministratore + "</td>"
        strh += "<td>" + Math.floor(s.cartelle.length / 27) + "</td>"
        strh += "<td>" + s.vincite + "</td>"
        strh += "<td>" + s.room + "</td>"


    });
    strh += "</table>"

    return strh
}


function stanze() {

    let aC = allClients

    let rr = []
    let rooms_ = aC.filter(c => c.amministratore).map(c => { return { admin: c.nickname, room: c.room } })



    let strh = "<table class='tbl'>"
    strh += "<tr><th>admin</th> <th> room</th></tr> "
    rooms_.forEach(r => {



        strh += "<tr>"
        strh += "<td>" + r.admin + "</td>"

        strh += "<td>" + r.room + "</td></tr>"



    });
    strh += "</table>"

    return strh
}


function verifica(comb, sck) {


    let righe = new Array(Math.floor(sck.cartelle.length / 27) * 3).fill(0);

    let fag = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    sck.cartelle.forEach((c, idx) => {



        let riga = Math.floor((idx % 27) / 9)
        let cart = Math.floor((idx / 27))
        riga += 3 * cart


        if (c > 0 && sck.fagioli[idx] == 1) {
            righe[riga]++
            fag[cart]++

        }


    })


    let verif = 0
    let brucr = 0
    let bruct = 0



    if (comb < 6) for (let r = 0; r < righe.length; r++) if (righe[r] == comb && sck.rbruc[r] == 0) { verif = 1; sck.rbruc[r] = 1; brucr = 1; };
    if (comb >= 6) for (let r = 0; r < fag.length; r++) if (fag[r] == 15 && sck.tbruc[r] == 0) { verif = 1; sck.tbruc[r] = 1; bruct = 1; }


    return verif

}

function mancanti(sck) {

    return

    console.log(sck)
    console.log(33333)
   
if (sck.cartelle==undefined) return [0]

    let righe = new Array(Math.floor(sck.cartelle.length / 27) * 3).fill(0);

    let fag = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    sck.cartelle.forEach((c, idx) => {

        let riga = Math.floor((idx % 27) / 9)
        let cart = Math.floor((idx / 27))
        riga += 3 * cart


        if (c > 0 && sck.fagioli[idx] == 1) {
            righe[riga]++
            fag[cart]++

        }


    })


    let manc = new Array(Math.floor(sck.cartelle.length / 27)).fill(15);

    for (let r = 0; r < manc.length; r++) manc[r] = 15 - fag[r]


    return [...manc]

}

function casuale(n) { return Math.floor(n * Math.random()) }
function arrotonda(n, c) { return Math.floor(n * 10 ** c + 0.5) / (10 ** c) }

function sanitizeInput(input) {
    return input.replace(/[&/\\#,+()$~%.^'":*?<>{}]/g, "");
}
//let portc = casuale(50) + 8040
let portc = 8040
const port = process.env.PORT || portc;


httpServer.listen(port);

console.log("Server in ascolto alla porta " + port);
