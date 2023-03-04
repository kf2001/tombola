

var socket;

var myNumber = 0;
var status = -2

var mynick = "";
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


    if (inviatoregolam) socket.emit("regolamento", msg)

}
function OKRegolam() {

   
  regolam=  {
        maxC: app.form.maxC ,
        prezzo: app.form.prezzo, auto: app.form.auto, vincunico: app.form.vincunico, ipmult:app.form.ipmult

    }

    console.log(regolam)


}

 
function init() {

    $(document).attr('title', mynick);

}

function connetti() {

    var strnick = new String($("#txtnick").val());
    var regexp = /[a-zA-Z0-9]+/gi;

    let pwwd = new String($("#txtpwd").val());
    let joins = new String($("#txtjoin").val());


    socket = io.connect();
    socket.nickname = strnick.match(regexp);

    socket.on('start', function (msg) {

        app.finecompera = true
        status = msg
        app.status = msg
        messaggia("Si va per " + messaggi[status], 0)
        app.estrai = true
        // socket.emit("miecartelle", {})

    });
    socket.on('numero', function (msg) {

        let pwwd = new String($("#txtpwd").val());
        let joins = new String($("#txtjoin").val());


        $("#mionumero").html(myNumber);
        //   socket.emit('join', socket.nickname);
        socket.emit('join', { nick: socket.nickname, pwd: pwwd, join: joins });
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

        socket.emit('tuttecartelle', {})

        // mostraregolamento
        //   mostraCartelle()

    });

    socket.on('amministratore', function (msg) {


        amministratore = true
        app.amministratore = true

        let tacclk = setInterval(chiedi_tabella, 1000)


    });

    socket.on('andato', function () { });
    socket.on('lista', function (msg) {

    });
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



function creaDiv(html, parent) {

    let nodo = document.createElement("div")

    nodo.innerHTML = html


    document.getElementById(parent).appendChild(nodo)
}

function compra(num) {

    socket.emit("compra", { mynumber: myNumber, cartella: num })
}

function via() {


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

