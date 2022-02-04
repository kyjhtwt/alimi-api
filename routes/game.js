const express = require("express");
const router = express.Router();
const db = require("../modules/MysqlConnect.js")

router.get('/turn', (req, res) => {
    db.query(`SELECT turn from game`, (err, result) => {
        if(err) throw err;
        res.send(result[0]);
    })
})

router.put('/turn', (req, res) => {
    db.query(`SELECT turn FROM game`, (err, rows) => {
        let turn = rows[0].turn
        db.query(`UPDATE game SET turn=${turn+1}`, (err, result) => {
            if(err) throw err;
            res.send(`${turn+1}`);
        })
    })
})

router.put('/default', (req, res) => {
    async function makeDefault(){
        await new Promise((resolve, reject) => {
            db.query(`UPDATE game SET turn=1`, (err, result) => {
                if(err) throw err;
                db.query(`TRUNCATE trade`);
                db.query(`TRUNCATE stocks`);
                db.query(`TRUNCATE prices`);
                db.query(`TRUNCATE teams`);
                resolve(0);
            })
        })
        await new Promise((resolve, reject) => {
            let stocks = ["bio", "construction", "electronics", "food", "broadcast"];
            for(let i = 0; i<5; i++){
                db.query(`SELECT EXISTS (SELECT * from stocks where title="${stocks[i]}" limit 1) as success`, (err, result) => {
                    if(err) throw err;
                    if(result[0].success == 0){
                        db.query(`INSERT INTO stocks (title, count) VALUES ("${stocks[i]}", 0)`);
                        db.query(`INSERT INTO prices (title, price, turn) VALUES ("${stocks[i]}", 0, 1)`);
                    }
                    if(i == 4) resolve(0);
                })
            }
        })
        res.send("reset game, you should update bio, construction, food, broadcast, electronics stocks");
    }
    makeDefault();
})

router.delete('/turn', (req, res) => {
    db.query(`UPDATE game SET turn=1`);
    res.send("set turn 1");
})

/**
*  @swagger
*  tags:
*    name: game
*    description: API to manage entire game.
*/
/**
*   @swagger
*  paths:
*   /game/turn:
*     get:
*       summary: get current turn
*       tags: [game]
*       responses:
*         "200":
*           description: get current turn
*     put:
*       summary: update turn
*       tags: [game]
*       responses:
*         "200":
*           description: update to next turn
*     delete:
*       summary: set turn 1
*       tags: [game]
*       responses:
*         "200":
*           description: set turn 1
*
*/

/**
*   @swagger
*  paths:
*   /game/default:
*     put:
*       summary: set game default state
*       tags: [game]
*       responses:
*         "200":
*           description: update to next turn
*
*/

module.exports = router;