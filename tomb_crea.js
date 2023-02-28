
let numeri = []

for (let i = 1; i <= 90; i++) numeri.push(i)

function colonna(num) {

    return Math.floor((num - 1 * (num == 90)) / 10)

}


let righe = numeri.map(n => colonna(n))

function verif(cartella) {

    let riga_ = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    cartella.forEach(c => riga_[colonna(c)]++)

    let maxr = Math.max(...riga_)
    let minr = Math.min(...riga_)

    return (maxr <= 2 && minr == 1)

}

function creaCartella(numeri) {

    let cart = []

    let palline = [...numeri]

    for (let i = 0; i < 15; i++) {

        let rnd = Math.floor(palline.length * Math.random())

        cart.push(palline[rnd])

        palline.splice(rnd, 1)
    }

    return [...cart]

}


let pall = [...numeri]

function recurs(rimaste, lv) {


    let rim = rimaste[lv]


    if (lv == 0) {

        let cart = creaCartella(parsify(rim))

        if (verif(cart)) {

            return (rimaste)
        }

        else {

            let rmm = ["", "", "", rimaste[3], rimaste[4], rimaste[5]]

            return (recurs([...rmm], 4))
        }

    }

    if (lv > 0) {
        let cart
        let tenta = 0
        do {
            cart = creaCartella(parsify(rim))
            tenta++

        } while (!verif(cart) && tenta < 100)

        if (tenta < 100) {
            let rm = parsify(rimaste[lv])
            cart.forEach(c => { rm.splice(rm.indexOf(c), 1) })

            rimaste[lv - 1] = stringify(rm)
            for (let ll = lv - 2; ll >= 0; ll--) rimaste[ll] = ""


            return recurs([...rimaste], lv - 1)
        }

        else {

            let rmm = ["", rimaste[1], rimaste[2], rimaste[3], rimaste[4], rimaste[5]]
            let llv = lv + 1
            if (llv > 5) llv = 5

            return (recurs([...rmm], llv, 1))


        }

    }

}

function crea() {

    let carts=[]
  //  document.getElementById("container").innerHTML = ""
    for (let n = 0; n < 6; n++) {

     //   creaDiv("", "container", "div" + n)

        let riminiz = ["", "", "", "", "", stringify(pall)]

        let fine = recurs(riminiz, 5, 0)
        let cartelle = []

        if (fine) {
            for (let i = 5; i > 0; i--)
                cartelle.push(diffarr(fine[i], fine[i - 1]))
            cartelle.push(parsify(fine[0]))


            let carr = []
            for (let i = 0; i < 6; i++)
                carr.push(arrangia(cartelle[i]))

            for (let i = 0; i < 6; i++) {

                let distrib = distribuisci(carr[i])
                carts=[...carts, ...distrib]
              //  creaDiv(toHTML(distrib, n), "div" + n, "div0" + n)
            }

        }
    }

return carts
}

function creaDiv(html, parent, idn) {


    let nodo = document.createElement("div")

    nodo.innerHTML = html
    nodo.id = idn


    document.getElementById(parent).appendChild(nodo)

}


function diffarr(a, b) {



    let a_ = parsify(a)
    let b_ = parsify(b)

    b_.forEach(bb => { a_.splice(a_.indexOf(bb), 1) })
    return a_

}

function stringify(arr) {

    let str = ""
    arr.forEach(a => str += (a + "-"))

    return (str)
}
function parsify(str) {

    let arr = str.split("-")
    let q = []
    arr.forEach(a => q.push(parseInt(a)))
    return (q.slice(0, -1))
}



function arrangia(cartstr) {

    //  let cartella = parsify(cartstr)
    let cartella = [...cartstr]


    let rg
    let tabella
    do {

        tabella = new Array(27).fill(0)
        rg = [0, 0, 0]
        cartella.forEach(c => {
            let cc = colonna(c);
            let riga = Math.floor(3 * Math.random())
            do {
                riga = (riga + 1) % 3

            } while (tabella[9 * riga + cc] != 0)
            tabella[9 * riga + cc] = c
            rg[riga]++


        })


    } while ((rg[1] - rg[2] != 0) || (rg[0] - rg[2] != 0))


    return [...tabella]

}

function toHTML(tabella, n) {



    let strh = "<table>"

    for (let r = 0; r < 3; r++) {
        strh += "<tr>"
        for (let c = 0; c < 9; c++) {

            let co = ""
            if (tabella[r * 9 + c] != 0) co = tabella[r * 9 + c]
            strh += "<td class='" + "back" + n + "'>" + co + "</td>"
        }
        strh += "</tr>"
    }
    strh += "</table>"

    return strh
}

function distribuisci(tabstr) {




    let falliti = 0

    tbl = [...tabstr]


    let f_vicini

    do {

        let rndcol = Math.floor(9 * Math.random())

        let strr = []

        for (let u = 0; u < 3; u++) if (tbl[u * 9 + rndcol] == 0) strr.push(0); else strr.push(1)


        let vuoto = strr.indexOf(0)
        let pieno = strr.indexOf(1)

        let valore = tbl[pieno * 9 + rndcol]

        valore = tbl[pieno * 9 + rndcol]

        let prectab = [...tbl]

        tbl[vuoto * 9 + rndcol] = valore;
        tbl[pieno * 9 + rndcol] = 0;
        let col
        do {

            col = casuale(9)

        } while (!((tbl[vuoto * 9 + col] > 0) && (tbl[pieno * 9 + col] == 0)))

        let valore2 = tbl[vuoto * 9 + col]

        tbl[vuoto * 9 + col] = 0;
        tbl[pieno * 9 + col] = valore2;


        f_vicini = vicini(tbl)
        let prec_vicini = vicini(prectab)

        if (f_vicini >= prec_vicini) {

            tbl = [...prectab]
            falliti++
        }
        else falliti = 0


    } while (falliti < 50)

    return [...tbl]

}


function vicini(tabella) {

    let vicini_ = 0
    let consecvert = 0

    for (let i = 0; i < 3; i++) {


        let consec = 0
        let maxconsec = 0


        if (tabella[i * 9 + 0] > 0 && tabella[i * 9 + 0] > 0) consecvert++
        if (tabella[i * 9 + 1] > 0 && tabella[i * 9 + 2] > 0) consecvert++

        for (let j = 0; j < 9; j++) {



            if (tabella[i * 9 + j] > 0) {

                consec++
                if (consec > maxconsec) maxconsec = consec
            }

            else consec = 0

        }

        vicini_ += maxconsec * maxconsec * maxconsec


    }
    vicini_ += consecvert * consecvert

    return vicini_
}


function casuale(n) { return Math.floor(n * Math.random()) }


let fine=crea()
console.log(crea())

require("fs").writeFileSync( "./cartelle.json",JSON.stringify(fine), "utf-8")

