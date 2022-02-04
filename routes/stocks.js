const express = require("express");
const router = express.Router();
const db = require("../modules/MysqlConnect.js")
const posting = require("../modules/postingLogic")


router.get('/', (req, res) => { // get all stocks
    db.query(`SELECT * FROM stocks`, (err, result) => {
        if(err) throw err;
        if(result.length == 0) res.send(result);
        else{
            let price = [];
            let data = [];
            let j;
            for(let i = 0; i<result.length; i++){
                db.query(`SELECT * FROM prices WHERE title="${result[i].title}" ORDER BY turn`, (err, rows) => {
                    if(err) throw err;
                    for(j=0; j<rows.length; j++){
                        price.push(rows[j].price);
                        if(i == result.length-1 && j == rows.length-1) {
                            data.push({"title":result[i].title, "count":result[i].count, "price":price});
                            res.send(data);
                        }
                    }
                    if(j == rows.length) {
                        data.push({"title":result[i].title, "count":result[i].count, "price":price});
                        price = [];
                    }
                })
            }
        }

    });
});

router.delete('/', (req, res) => {
    db.query(`TRUNCATE stocks`);
    db.query(`TRUNCATE prices`);
    res.send("delete all stock info")
});

router.post('/', (req, res) => {
    let stocks = ["bio", "construction", "electronics", "food", "broadcast"];
    for(let i = 0; i<5; i++){
        db.query(`SELECT EXISTS (SELECT * from stocks where title="${stocks[i]}" limit 1) as success`, (err, result) => {
            if(err) throw err;
            if(result[0].success == 0){
                db.query(`INSERT INTO stocks (title, count) VALUES ("${stocks[i]}", 0)`);
                db.query(`INSERT INTO prices (title, price, turn) VALUES ("${stocks[i]}", 0, 1)`);
            }
        })
        if(i == 4) res.send("SET Default status");
    }
})

router.get('/:field', (req, res) => {   // get ${req.params.field} stock
    let price = []
    db.query(`SELECT * FROM stocks WHERE title="${req.params.field}"`, (err, result) => {
        let count = result[0].count;
        if(err) throw err;
            db.query(`SELECT * FROM prices WHERE title="${req.params.field}" ORDER BY turn`, (err, result) => {
                if(err) throw err;
                for(let i = 0; i<result.length; i++){
                    price.push(result[i].price);
                    if(i == result.length-1){
                        res.send({"title":req.params.field, "count":count, "price":price});
                    }
                }
            });
    });
})

router.post('/:field', (req, res) => {
    let body = req.body;
    let price = [];
    for(let i = 0; i<req.body.price.length; i++){
        price.push(body.price[i]);
    }
    async function aaa(){
        await new Promise((resolve, reject) => {
            resolve(posting(req, body, price))
        })
        res.send("post!!")
    }
    aaa()
})

router.delete('/:field', (req, res) => {
    db.query(`DELETE FROM stocks WHERE title="${req.params.field}"`);
    res.send(`deleted ${req.params.field} stock`);
})

/**
*  @swagger
*  tags:
*    name: stocks
*    description: API to manage stocks.
*/
/**
*   @swagger
*  paths:
*   /stocks:
*     get:
*       summary: List all stocks
*       tags: [stocks]
*       responses:
*         "200":
*           description: The list of stocks.
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/stocks'
*     post:
*       summary: post all default stocks (bio, construction, food, broadcast, electronics, All price = 0, count = 0)
*       tags: [stocks]
*       responses:
*         "200":
*           description: post success
*     delete:
*       summary: delete all stocks
*       tags: [stocks]
*       responses:
*         "200":
*           description: delete the list of stocks.
*/

/**
*   @swagger
*  paths:
*   /stocks/{field}:
*     get:
*       summary: a stock price and count of specific field
*       tags: [stocks]
*       parameters:
*           - in: path
*             name: field
*             description: field of stock trying to find
*             required: true
*             schema:
*               type: string
*       responses:
*         "200":
*           description: a stock of specific field
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/stocks'
*     post:
*       summary: post a stock
*       tags: [stocks]
*       parameters:
*           - in: path
*             name: field
*             description: field of stock trying to find
*             required: true
*             schema:
*               type: string
*       responses:
*         "200":
*           description: success
*       requestBody:
*             required: true
*             content:
*               application/json:
*                   schema:
*                       $ref: '#/components/schemas/postStocks'
*     delete:
*       summary: delete a stock of specific field
*       tags: [stocks]
*       parameters:
*           - in: path
*             name: field
*             description: field of stock trying to find
*             required: true
*             schema:
*               type: string
*       responses:
*         "200":
*           description: delete a stock of specific field
*/

module.exports = router;