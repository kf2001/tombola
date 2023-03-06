

var socket;

var myNumber = 0;
var status = -2

var myNick = "";
var Room = "";

var colori = []
var mieicolori = []

//  var amministratore = 0

var messaggi = ["l'ambo", "il terno", "la quaterna", "la cinquina", " la tombola", "per il tombolino"]

var regolam = {}
var comprate = 0
var estratte = []
var pallina
var mieCartelle = []
//  var fagioli = []
var fagioli = new Array(36 * 27).fill(0);
var rbruc = new Array(20).fill(0)
var tbruc = new Array(12).fill(0)

var inviatoregolam = false


let combinaz = ["", "", "ambo", "terno", "quaterna", "cinquina", "tombola", "tombolino"]


function InviaRegolamento() {


    socket.emit("regolamento", regolam)

}
function OKRegolam() {


    myNick = app.form.nick
    Room = app.form.join


    var regexp = /^[a-zA-Z0-9]{3,10}$/gi;

    if (!regexp.test(app.form.nick)) {

        return
    }


    regolam = {
        maxC: app.form.maxC,
        prezzo: app.form.prezzo, auto: app.form.auto, vincunico: app.form.vincunico, ipmult: app.form.ipmult

    }

    connetti()

}


function init() {

    $(document).attr('title', mynick);

}

function connetti() {


    socket = io.connect();
    socket.nickname = myNick;

    socket.on('start', function (msg) {

        app.finecompera = true
        status = msg
        app.status = msg
        messaggia("Si va per " + messaggi[status], 0)
        app.estrai = true

    });
    socket.on('numero', function (msg) {


        let joins = Room;

        socket.emit('join', { nick: socket.nickname, join: joins });
        app.loggato = true

        init()


    });

    socket.on('premi', function (msg) {



        app.premitab = msg


    });

    socket.on('regolamento', function (msg) {

        status = -1
        app.status = -1
        regolam = msg

        console.log(999999)

        socket.emit('tuttecartelle', {})



    });

    socket.on('amministratore', function (msg) {


        amministratore = true
        app.amministratore = true

        let tacclk = setInterval(chiedi_tabella, 1000)


    });

    socket.on('andato', function () { });

    socket.on('tuttecartelle', function (msg) {


        mostraCartelle(msg.cartelle, msg.colori, new Array(36 * 27).fill(0), 0)


    });

    socket.on('combinaz', function (msg) {

        messaggia(msg.nick + " ha fatto " + msg.comb + "!! ", 1)
        app.estrai = false

    });


    socket.on('estratta', function (msg) {

        messaggia("", 0)
        pallina = msg
        estratte.push(pallina)

        app.pallina = pallina
        let comb = status * 1 + 2
        tabellone(estratte)

        if (regolam.auto) {
            mettifagiolo(pallina)
            if (verifica(comb)) socket.emit("chiama", combinaz[comb])


        }


    });

    socket.on('cartellegioc', function (msg) {


        mostraCartelle(msg.cartelle, msg.colori, msg.fagioli, 2);

    });
    socket.on('miecartelle', function (msg) {


        comprate = Math.floor(msg.cartelle.length / 27)
        app.comprate = comprate
        if (app.comprate == regolam.maxC) app.finecompera = true
        mieicolori = msg.colori
        mieCartelle = [...msg.cartelle]
        let fagg = new Array(36 * 27).fill(0);

        mostraCartelle(msg.cartelle, mieicolori, fagg, 1);

    });

    socket.on('tabhtml', function (msg) {


        app.tabhtml = msg

    });



    mynick = socket.nickname;
}


function mostraCartelle(cartelle, colori_, fagg_, mie) {

    let cont = "tcontainer"
    if (mie == 1) cont = "mcontainer"
    if (mie == 2) cont = "gcontainer"
    document.getElementById(cont).innerHTML = ""


    let rimaste = cartelle.length / 27

    let cart = []

    for (let c = 0; c < rimaste; c++)

        cart.push(cartelle.slice(c * 27, c * 27 + 27))



    cart.forEach((c, idx) => { creaDiv(toHTML(c, colori_[idx], idx, fagg_.slice(27 * idx, 27 * idx + 27), rbruc.slice(3 * idx, 3 * idx + 3)), cont, status, idx) })

}


function toHTML(tabella, n, idx, fag, bruc) {


    let strh = "<table>"

    for (let r = 0; r < 3; r++) {
        if (bruc[r] == 10)
            strh += "<tr  style='cursor: pointer;' onclick=" + "check(" + r + "," + idx + ")>"; else
            strh += "<tr  style='border-color:#c00000;cursor: pointer; '  >";

        for (let c = 0; c < 9; c++) {

            let co = ""
            if (tabella[r * 9 + c] != 0) co = tabella[r * 9 + c]
            if (fag) {
                //  console.log(fag[r * 9 + c])
                if (fag[r * 9 + c] == 0) strh += "<td class='" + "back" + n + "' onclick=" + "'check(" + (r * 9 + c) + "," + idx + ")'>" + co + "</td>";
                else strh += "<td class='" + "back10' >" + co + "</td>"
            }

        }
        strh += "</tr>"
    }
    strh += "</table>"

    return strh
}


function disegna_tessera(ctx, x, y, lato, num) {


    var canvas = document.createElement('canvas');


    // let x=100
    // let y=100
    // let lato=30

    lato = 7*lato / 16
    ctx.beginPath()
    ctx.fillStyle = "red";
    ctx.strokeStyle = "#cc0000"
    ctx.lineWidth = lato / 3

        ;
     ctx.ellipse(x, y, lato * .8, lato * .8, 0, 0, 2 * Math.PI)
    ctx.stroke() 
   /*  ctx.fillStyle = "blue";
    ctx.ellipse(x, y, lato * .6, lato * .6, 0, 0, 2 * Math.PI) */

    ctx.fill()

    ctx.fillStyle = "beige";
    //ctx.strokeStyle = "beige"

    //ctx.ellipse(x, y, lato * .4, lato * .4, 0, 0, 2 * Math.PI)
    ctx.fill()

    ctx.fillStyle = "#cc0000";
    /* ctx.shadowColor = '#808080';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = -2;
    ctx.shadowOffsetY = -2; */
    ctx.font = "bold 32px mono";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText(num, x, y)

}





function tabellone(estratte_) {




    if (estratte_.length == 0) return;
    var canvas = document.createElement('canvas');

    canvas.id = "tabellone";
    canvas.width = "900";
    canvas.height = "360";


    canvas.style.zIndex = 8;
    canvas.style.position = "absolute";
    canvas.style.border = "1px solid";


    var ctx = canvas.getContext("2d");

    ctx.fillStyle = "#40404";
    ctx.font = "40px Arial bold";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    let lato = canvas.width / 15
    for (let i = 0; i < 90; i++) {
        ctx.strokeStyle = "#40404"
        ctx.fillStyle = "#40404";
        ctx.font = "40px Arial bold";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.lineWidth = 1

        let riga = Math.floor((i) / 15)
        let colonna = i % 15
        ctx.fillStyle = "#404040";
        ctx.rect(lato * colonna, lato * riga, lato, lato)
        ctx.strokeStyle = "#404040"
        ctx.stroke()
        if (estratte_.indexOf(i + 1) > -1) {

            disegna_tessera(ctx, lato * colonna + lato / 2, lato * riga + lato / 2, lato, (i + 1))


        } else {
          
             ctx.fillText((i + 1), lato * colonna + lato / 2, lato * riga + lato / 2)


        }
    }

    document.getElementById("tabcanvas").innerHTML = "";
    document.getElementById("tabcanvas").appendChild(canvas);



}


function creaDiv(html, parent) {

    let nodo = document.createElement("div")

    nodo.innerHTML = html


    document.getElementById(parent).appendChild(nodo)
}

function compra(num) {

    socket.emit("compra", { mynumber: myNumber, cartella: num })
}

function via() {


    if (status == -2) socket.emit("regolamento", regolam); else
        socket.emit("via", status)


}

function estraiNumero() {

    socket.emit("estrai", {})

}

function mettifagiolo(pall) {


    mieCartelle.forEach((c, idx) => {

        if (estratte.indexOf(c) > -1) fagioli[idx] = 1
    })

    socket.emit('fagioli', fagioli)

    mostraCartelle(mieCartelle, mieicolori, fagioli, 1)

}

function verifica(comb) {


    let righe = new Array(Math.floor(mieCartelle.length / 27) * 3).fill(0);

    let fag = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    mieCartelle.forEach((c, idx) => {

        let riga = Math.floor((idx % 27) / 9)
        let cart = Math.floor((idx / 27))
        riga += 3 * cart


        if (c > 0 && fagioli[idx] == 1) {
            righe[riga]++
            fag[cart]++
        }


    })


    let verif = 0

    if (comb < 6) for (let r = 0; r < righe.length; r++) if (righe[r] == comb && rbruc[r] == 0) { verif = 1; rbruc[r] = 1; };
    if (comb >= 6) for (let r = 0; r < fag.length; r++) if (fag[r] == 15 && tbruc[r] == 0) { verif = 1; tbruc[r] = 1; }



    return verif

}

function messaggia(mess, append) {
    if (append)
        app.messaggio += mess;
    else
        app.messaggio = mess;
}


function check(riga_, ncart_) {

    if (status < 0 && comprate < regolam.maxC) socket.emit("compra", { mynumber: myNumber, cartella: ncart_ });
    if (status < 0) return;

    let comb = status * 1 + 2

    if (estratte.indexOf(mieCartelle[27 * ncart_ + riga_]) > -1) {
        fagioli[27 * ncart_ + riga_] = 1
        socket.emit('fagioli', fagioli)
        mostraCartelle(mieCartelle, mieicolori, fagioli, 1)
        if (verifica(comb)) socket.emit("chiama", combinaz[comb])

    }
}



function chiedi_tabella() {

    socket.emit("tabella", {})


}

function chat(sid) {

    socket.emit("togglechat", sid)
    console.log(888)
}


function cartgioc(sid) {
    console.log(777)

    socket.emit("chiedicartelle", sid)
}

function disconn(sid) {

    socket.emit("chiedidisconn", sid)

}
