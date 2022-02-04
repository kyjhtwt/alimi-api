const express = require("express");
const router = express.Router();
const db = require("../modules/MysqlConnect.js")
const {logger}= require('../logs/logger');


router.get('/all', (req, res) => {
    db.query(`SELECT * FROM trade`, (err, result) => {
        res.send(result);
    })
})

router.get('/', (req, res) => {
    const teamId = req.query.teamId;
    const turn = req.query.turn;
    const tradeType = req.query.tradeType;
    db.query(`SELECT preCash, bio, construction, electronics, food, broadcast FROM trade WHERE teamId=${teamId} && turn=${turn} && tradeType="${tradeType}"`, (err, result) => {
            if(result[0] == undefined){
                res.send("fail");
            }
            else{
                res.send(result[0]);
            }
        })
})

router.get('/success', (req, res) => {
    const teamId = req.query.teamId;
    const turn = req.query.turn;
    const tradeType = req.query.tradeType;
    if(tradeType == "sale"){
        db.query(`SELECT preCash, bio, construction, electronics, food, broadcast FROM trade WHERE teamId=${teamId} && turn=${turn} && tradeType="${tradeType}"`, (err, result) => {
            if(result[0] == undefined){
                res.send("fail");
            }
            else{
                res.send(result[0]);
            }
        })
    }
    else if(tradeType == "purchase"){
        db.query(`SELECT preCash, bioSuccess AS bio, constructionSuccess AS construction, electronicsSuccess AS electronics, foodSuccess AS food, broadcastSuccess AS broadcast FROM trade WHERE teamId=${teamId} && turn=${turn} && tradeType="${tradeType}"`, (err, result) => {
            if(result[0] == undefined){
                res.send("fail");
            }
            else{
                res.send(result[0]);
            }
        })
    }
});

router.get('/PurchaseResult', (req,res) => {
    const teamId = req.query.teamId;
    const turn = req.query.turn;
    const tradeType = req.query.tradeType;
    //logger.info(teamId)
    if(tradeType == "sale"){
        db.query(`SELECT preCash, bio, construction, electronics, food, broadcast FROM trade WHERE teamId=${teamId} && turn=${turn} && tradeType="${tradeType}"`, (err, result) => {
            if(result[0] == undefined){
                res.send("fail");
            }
            else{
                res.send(result[0]);
            }
        })
    }
    else if(tradeType == "purchase"){
        db.query(`SELECT preCash, bioSuccess, constructionSuccess, electronicsSuccess, foodSuccess, broadcastSuccess FROM trade WHERE teamId=${teamId} && turn=${turn} && tradeType="${tradeType}"`, (err, result) => {
            if(result[0] == undefined){
                db.query(`SELECT cash FROM teams WHERE id=${teamId}`, (err, CashList) => {
                    if(err) throw err;
                    res.send({
                        "Cash": CashList[0].cash,
                        "returnCash":0,
                        "bioFailed":0,
                        "constructionFailed": 0,
                        "electronicsFailed": 0,
                        "foodFailed": 0,
                        "broadcastFailed": 0,
                        "bioSuccess":0,
                        "constructionSuccess":0,
                        "electronicsSuccess":0,
                        "foodSuccess":0,
                        "broadcastSuccess":0
                    });
                })                

            }
            else{
                async function sendingLogic(){
                    let bioFailed
                    let constructionFailed
                    let electronicsFailed
                    let foodFailed
                    let broadcastFailed
                    let turn
                    let purchaseResult
                    let returnCash = 0;
                    let teamCash
                    await new Promise((resolve, reject) => {
                       db.query(`SELECT turn FROM game`, (err, turnList) => {
                           if(err) throw err;
                           turn = turnList[0].turn;
                           resolve("t");
                       })
                    })
                    await new Promise((resolve, reject) => {
                        db.query(`SELECT * FROM trade`, (err, result) => {
                            if(err) throw err;
                            let length = result.length
                            db.query(`SELECT turn From trade ORDER BY turn`, (err, turnList) => {
                                if(err) throw err;
                                if(turnList[length - 1].turn < turn) {
                                    turn=turnList[length - 1].turn
                                }
                                resolve(1)
                            })
                        })
                    })
                    // await new Promise((resolve, reject) => {
                    //     resolve(ck())
                    // })
                    await new Promise((resolve, reject) => {
                        db.query(`SELECT * FROM trade WHERE teamId=${teamId} && turn=${turn} && tradeType="${tradeType}"`, (err, rows) => {
                            if(err) throw err;
                            bioFailed = rows[0].bio - result[0].bioSuccess;
                            constructionFailed = rows[0].construction - result[0].constructionSuccess;
                            electronicsFailed= rows[0].electronics - result[0].electronicsSuccess;
                            foodFailed = rows[0].food - result[0].foodSuccess;
                            broadcastFailed = rows[0].broadcast - result[0].broadcastSuccess;
                             resolve("f");
                        })
                    });
                    await new Promise((resolve, reject) => {
                        db.query(`SELECT * FROM prices WHERE turn=${turn} ORDER BY title`, (err, priceList) => {
                            if(err) throw err;
                            returnCash += bioFailed * priceList[0].price;
                            returnCash += constructionFailed * priceList[2].price;
                            returnCash += broadcastFailed * priceList[1].price;
                            returnCash += foodFailed * priceList[4].price;
                            returnCash += electronicsFailed * priceList[3].price;
                            resolve("s")
                        })
                    })
                    await new Promise((resolve, reject) => {
                        db.query(`SELECT cash FROM teams WHERE id=${teamId}`, (err, cash) => {
                            if(err) throw err;
                            teamCash = cash[0].cash;
                            resolve("d");
                        })
                    })
                    await new Promise((resolve, reject) => {
                        if(err) throw err;
                        purchaseResult = {
                            "Cash": teamCash,
                            "returnCash":returnCash,
                            "bioFailed":bioFailed,
                            "constructionFailed": constructionFailed,
                            "electronicsFailed": electronicsFailed,
                            "foodFailed": foodFailed,
                            "broadcastFailed": broadcastFailed,
                            "bioSuccess":result[0].bioSuccess,
                            "constructionSuccess":result[0].constructionSuccess,
                            "electronicsSuccess":result[0].electronicsSuccess,
                            "foodSuccess":result[0].foodSuccess,
                            "broadcastSuccess":result[0].broadcastSuccess
                        }
                        db.query(`UPDATE teams SET cash=cash+${returnCash} WHERE id=${teamId}`, (err) => {
                            if(err) throw err;
                            resolve("s");
                        })
                    })
                    logPurchaseResult = {
                        "Cash": teamCash,
                        "returnCash":returnCash,
                        "bioFailed":bioFailed,
                        "constructionFailed": constructionFailed,
                        "electronicsFailed": electronicsFailed,
                        "foodFailed": foodFailed,
                        "broadcastFailed": broadcastFailed,
                        "bioSuccess":result[0].bioSuccess,
                        "constructionSuccess":result[0].constructionSuccess,
                        "electronicsSuccess":result[0].electronicsSuccess,
                        "foodSuccess":result[0].foodSuccess,
                        "broadcastSuccess":result[0].broadcastSuccess,
                        "teamId":teamId,
                        "turn":turn
                    }
                    logger.info(JSON.stringify(logPurchaseResult))
                    res.send(purchaseResult);
                }
                setTimeout(() => {
                    sendingLogic()
                },1000)
            }
        })
    }
})


router.post('/', (req, res) => {
    const teamId = req.query.teamId;
    const turn = req.query.turn;
    const preCash = req.query.preCash;
    const tradeType = req.query.tradeType
    db.query(`SELECT EXISTS (SELECT * from trade where teamId=${teamId} && turn=${turn} && tradeType="${tradeType}" limit 1) as success`, (err, result) => {
        if(result[0].success == 0){
            db.query(`INSERT INTO trade (teamId, turn, preCash, tradeType) VALUES(${teamId}, ${turn}, ${preCash}, "${tradeType}")`, (err, result) =>{
                if(err) throw err;
                res.send("success");
            });
        }
        else{
            res.send("fail");
        }
    });
});

router.put('/', (req, res) => {
    const teamId = req.query.teamId;
    const turn = req.query.turn;
    const field = req.query.field;
    const amount = req.query.amount;
    const tradeType = req.query.tradeType;
    let price;
    let cash;
    let preAmount;
    db.query(`SELECT EXISTS (SELECT * from trade where teamId=${teamId} && turn=${turn} && tradeType="${tradeType}" limit 1) as success`, (err, result) => {
        if(result[0].success == 0) res.send("fail");
        else{
            async function ma() {
                await new Promise((resolve, result) => {
                    db.query(`SELECT ${field} FROM trade WHERE teamId=${teamId} && turn=${turn} && tradeType="${tradeType}"`, (err, re) => {
                        if(err) throw err;
                        notZero = re[0][field]
                        if(notZero){
                            db.query(`UPDATE trade SET ${field}=${field} + ${amount}, ${field}Time=NOW() WHERE teamId=${teamId} && turn=${turn} && tradeType="${tradeType}"`, (err, result) => {
                                if(err) throw err;
                                resolve(0);
                                })
                        }
                        else{
                            db.query(`UPDATE trade SET ${field}=${amount}, ${field}Time=NOW() WHERE teamId=${teamId} && turn=${turn} && tradeType="${tradeType}"`, (err, result) => {
                                if(err) throw err;
                                resolve(0);
                                })
                        }
                    })
                    });
                await new Promise((resolve, result) => {
                    db.query(`SELECT price FROM prices WHERE title="${field}" && turn="${turn}"`, (err, result) => {
                        price = result[0].price;
                        resolve(price);
                        })
                    });
                await new Promise((resolve, result) => {
                    db.query(`SELECT * FROM teams WHERE id=${teamId}`, (err, result) => {
                        if(err) throw err;
                        cash = result[0].cash;
                        preAmount = result[0][field];
                        resolve(0);
                        })
                    });
                if(tradeType == "purchase"){
                    db.query(`UPDATE teams SET cash=${cash-price*amount} WHERE id=${teamId}`, (err, result) => {
                        if(err) throw err;
                        res.send("success");
                        });
                    }
                else if(tradeType == "sale"){
                    db.query(`UPDATE teams SET cash=${cash+price*amount}, ${field}=${Number(preAmount) - Number(amount)} WHERE id=${teamId}`, (err, result) => {
                        if(err) throw err;
                        db.query(`SELECT count FROM stocks WHERE title="${field}"`, (err, row) => {
                            if(err) throw err;
                            let count = row[0].count;
                            db.query(`UPDATE stocks SET count=${Number(count) + Number(amount)} WHERE title="${field}"`, (err, result) => {
                                if(err) throw err;
                                db.query(`SELECT ${field} AS stock FROM teams WHERE id=${teamId}`, (err, stc) => {
                                    if(err) throw err;
                                    let teamStockNum = stc[0].stock
                                    if(teamStockNum == 0){
                                        db.query(`UPDATE trade SET ${field}Success = 0 WHERE turn<${turn} && teamId=${teamId}`, (err) => {
                                            if(err) throw err;
                                        })
                                    }
                                })
                                res.send("success");

                            })
                    })
                });
                }
                }
                ma();
            }
        });
    });


router.delete('/', (req, res) => {
    db.query(`TRUNCATE trade`);
    res.send("delete all trade")
})

/**
*  @swagger
*  tags:
*    name: trade
*    description: API to manage trade.
*/
/**
*   @swagger
*  paths:
*   /trade/all:
*     get:
*       summary: List all requested trade history
*       tags: [trade]
*       responses:
*         "200":
*           description:  List all requested trade history.
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/trade'
*/

/**
*   @swagger
*  paths:
*   /trade/success:
*     get:
*       summary: success trade of specific team and turn
*       tags: [trade]
*       parameters:
*           - in: query
*             name: teamId
*             description: Id of the team
*             required: true
*             schema:
*               type: integer
*           - in: query
*             name: turn
*             description: turn
*             required: true
*             schema:
*               type: integer
*           - in: query
*             name: tradeType
*             description: type of trade. purchase or sale
*             required: true
*             schema:
*               type: string
*       responses:
*         "200":
*           description: trade
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/trade'
*/

/**
*   @swagger
*  paths:
*   /trade/PurchaseResult:
*     get:
*       summary: success trade of specific team and turn
*       tags: [trade]
*       parameters:
*           - in: query
*             name: teamId
*             description: Id of the team
*             required: true
*             schema:
*               type: integer
*           - in: query
*             name: turn
*             description: turn
*             required: true
*             schema:
*               type: integer
*           - in: query
*             name: tradeType
*             description: type of trade. purchase or sale
*             required: true
*             schema:
*               type: string
*       responses:
*         "200":
*           description: trade
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/purChaseResult'
*/

/**
*   @swagger
*  paths:
*   /trade:
*     get:
*       summary: trade of specific team and turn
*       tags: [trade]
*       parameters:
*           - in: query
*             name: teamId
*             description: Id of the team
*             required: true
*             schema:
*               type: integer
*           - in: query
*             name: turn
*             description: turn
*             required: true
*             schema:
*               type: integer
*           - in: query
*             name: tradeType
*             description: type of trade. purchase or sale
*             required: true
*             schema:
*               type: string
*       responses:
*         "200":
*           description: trade
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/trade'
*     post:
*       summary: trade of specific team and turn
*       tags: [trade]
*       parameters:
*           - in: query
*             name: teamId
*             description: Id of the team
*             required: true
*             schema:
*               type: integer
*           - in: query
*             name: turn
*             description: turn
*             required: true
*             schema:
*               type: integer
*           - in: query
*             name: tradeType
*             description: type of trade. purchase or sale
*             required: true
*             schema:
*               type: string
*           - in: query
*             name: preCash
*             description: amount of the cash the team had before the trade
*             required: true
*             schema:
*               type: integer
*       responses:
*         "200":
*           description: trade
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/trade'
*     put:
*       summary: trade of specific team and turn
*       tags: [trade]
*       parameters:
*           - in: query
*             name: teamId
*             description: Id of the team
*             required: true
*             schema:
*               type: integer
*           - in: query
*             name: turn
*             description: turn
*             required: true
*             schema:
*               type: integer
*           - in: query
*             name: field
*             description: field of stock trying to trade
*             required: true
*             schema:
*               type: string
*           - in: query
*             name: amount
*             description: amount of specific stock trying to trade
*             required: true
*             schema:
*               type: integer
*           - in: query
*             name: tradeType
*             description: type of trade. purchase or sale
*             required: true
*             schema:
*               type: string
*       responses:
*         "200":
*           description: trade
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/trade'
*     delete:
*       summary: delete all trades
*       tags: [trade]
*       responses:
*         "200":
*           description: delete all trades.
*
*/

module.exports = router;