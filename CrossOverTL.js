//Dependancies
const xrpl = require("xrpl")
const fs = require("fs")

//LOCALLY MADE COMMANDS
const {currentledger} = require("./Functions/currentledger")
const {getalltls} = require("./Functions/getalltls")
const {savejson} = require('./Functions/savejson')

const {
    xconnect,
    xReconnect
} = require('./Functions/xrplConnect')

//config file reporting
const {
    nodes,
    retrymax,
    tokens
} = require('./config.json');

//Define initial client
var client = new xrpl.Client(nodes[0])


//Error Handling
process.on('unhandledRejection', async (reason, promise) => {
    try {
        fs.writeFileSync(`./data/ADRun${a}.json`, data)
    } catch {}
    var error = `Unhandled rejection at, ${promise}, reason: ${reason}`;
    console.log(error)
    fs.writeFileSync("./ERRORS.txt", `\nUnhandled Rejection: ${error}`)
    process.exit(1)
});

process.on('uncaughtException', async (err) => {
    try {
        fs.writeFileSync(`./data/ADRun${a}.json`, data)
    } catch {}
    console.log(`Uncaught Exception: ${err.message}`)
    fs.writeFileSync("./ERRORS.txt", `\nUncaught Exception: ${err.message}`)
    process.exit(1)
});

async function main() {

    //connect to XRPL
    client = await xconnect(client, nodes)

    //reconnect unpon disconnect
    client.on('disconnected', async () => {
        client = await xReconnect(client, nodes);
    });

    //Get current validated ledger
    var searchCount = 0
    while (searchCount < retrymax) {
        try {
            var current = await currentledger(client, "validated") //returns [ledgerindex, ledgertime]
            var currentledgerindex = current[0]
            var currentledgertime = xrpl.rippleTimeToUnixTime(current[1]) / 1000
            console.log(`\nThe time since Epoch is ${currentledgertime} seconds, LedgerIndex is ${currentledgerindex}`)
            break
        } catch (err) {
            console.log(`Error Getting Current Ledger ${searchCount}`)
            searchCount += 1

            if (searchCount == retrymax) {
                fs.writeFileSync("./ERRORS.txt", `\nCOULDN"T GET CURRENT LEDGER\n LIKELY TO BE AN ISSUE WITH WEBSOCKET OR INTERNET CONNECTION`)
                process.exit(1)
            }
        }
    }

    //for every defined token
    var objOfAccounts = {}
    for (a in tokens) {
        var current = tokens[a]
        var name = current.name
        var hex = current.hex
        var issuer = current.issuer

        //snapshot TLs
        console.log(`\nSnapshotting all Trustlines for $${name} During LedgerSequence ${currentledgerindex}`)
        var checkCount = 0
        while (checkCount < retrymax) {
            try {
                var snapshot = await getalltls(client, issuer, currentledgerindex)
                console.log(`SNAPSHOT TAKEN FOR $${name}`)
                break
            } catch (err) {
                console.log(`Error Taking Snapshot ${checkCount}`)
                checkCount += 1
            }

            if (checkCount == retrymax) {
                fs.writeFileSync("./ERRORS.txt", `\nCOULDN"T SNAPSHOT TOKEN ${name} FROM VARIABLE ${a}\n LIKELY TO BE AN ISSUE WITH DATA INPUTTED INTO THE CONFIG FILE (OR CONNECTIONS/WEBSOCKET)`)
                process.exit(1)
            }
        }

        //Seperate Addresses as needed
        var allArray = []
        var holdArray = []
        for (b in snapshot) {
            if (snapshot[b].currency == hex) {
                allArray.push(snapshot[b].account)

                var holding = Math.abs((Number(snapshot[b].balance)))
                if(holding > 0){
                    holdArray.push(snapshot[b].account)
                }
            }
        }

        objOfAccounts[name] = {
            Holders: holdArray,
            All: allArray
        }
    }

    //Report results and calculate crossover
    var crossoverHolders = []
    var discardHolder = []
    var crossoverAll = []
    var discardAll = []

    console.log(`\n\n____RESULTS___`)
    var keys = Object.keys(objOfAccounts)
    for (c in keys) {
        var key = keys[c]
        var holders = objOfAccounts[key].Holders
        var all = objOfAccounts[key].All

        console.log(
            `$${key}:
                  Total Trustlines:   ${all.length} Accounts
                  Holders:            ${holders.length} Accounts`
        )
        for (d in holders) {
            if (!(discardHolder.includes(holders[d]))){
                discardHolder.push(holders[d])
            } else {
                crossoverHolders.push(holders[d])
            }
        }
        for (d in all) {
            if (!(discardAll.includes(all[d]))){
                discardAll.push(all[d])
            } else {
                crossoverAll.push(all[d])
            }
        }
    }

    //report crossover
    console.log(
        `Cross-Over:
              Total Trustlines:   ${crossoverAll.length} Accounts with All Trustlines   
              Holders:            ${crossoverHolders.length} Accounts Holding All Tokens`
    )

    //save the addresses that crossover as a JSON Array
    await savejson(`./CrossOverHolders.json`, crossoverHolders)
    await savejson(`./CrossOverAllTL.json`, crossoverAll)

    process.exit(1)
}




main()