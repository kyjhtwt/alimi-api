const db = require("./MysqlConnect")


async function buyingLogic(){
    let overPurStock = [];
    let totalCount = [];
    let overPrice = [];
    let overAmount = [];
    let notOverStock = [];
    let notOverPrice = [];
    let notOverAmount = [];
    let notOverCount = [];
    let turn = 0;
    await new Promise((resolve, reject) => {
        db.query(`SELECT * FROM game`, (err, result) => {
            if(err) throw err;
            turn = result[0].turn;
            resolve(turn)
        })
    })
    await new Promise((resolve, reject) => {
        db.query(`SELECT * FROM trade`, (err, result) => {
            if(err) throw err;
            let length = result.length
            db.query(`SELECT turn From trade`, (err, turnList) => {
                if(err) throw err;
                let a
                if(turnList[length - 1].turn < turn) {turn=turnList[length - 1].turn}
                resolve(1)
            })
        })
    })
    let stock = ["bio", "construction", "food", "electronics", "broadcast"];
    for(let i = 0; i<5; i++){
        await new Promise((resolve, reject) => {
            let total = -1;
            db.query(`SELECT sum(${stock[i]}) AS total FROM trade WHERE turn=${turn} && tradeType="purchase"`, (err, result) => {
                if(err) throw err;
                total = result[0].total;
                db.query(`SELECT * FROM stocks WHERE title="${stock[i]}"`, (err, rows) => {
                    if(err) throw err;
                    db.query(`SELECT * FROM prices WHERE title="${stock[i]}" && turn=${turn}`, (err, priceList) => {
                        if(err) throw err;
                        if(rows[0].count >= total){
                            notOverStock.push(stock[i]);
                            notOverPrice.push(priceList[0].price);
                            notOverCount.push(rows[0].count);
                            resolve(1);
                        }
                        else{
                            overPurStock.push(stock[i]);
                            overPrice.push(priceList[0].price);
                            overAmount.push(total);
                            resolve(1);
                        }
                    })
                    
                })
            })
        });
    }
    for(let k = 0; k<notOverStock.length; k++){
        let NumofTeam
        let result;
        let count = 0;
        await new Promise((resolve, reject) => {
            db.query(`SELECT ${notOverStock[k]} AS stock, teamId AS teamId, preCash FROM trade WHERE turn=${turn} && tradeType="purchase"`, (err, rows) => {
                if(err) throw err;
                result = rows;
                NumofTeam = result.length
                resolve("!");
            })
        });
        await new Promise((resolve, reject) => {
            db.query(`SELECT count FROM stocks WHERE title="${notOverStock[k]}"`, (err, countList) => {
                if(err) throw err;
                notOverCount[k] = countList[0].count;
                resolve("d")
            })
        });
        for(let j = 0; j<NumofTeam; j++){
            await new Promise((resolve, reject) => {
                db.query(`UPDATE teams SET ${notOverStock[k]}=${notOverStock[k]}+${result[j].stock} WHERE id=${result[j].teamId}`, (err) => {
                    if(err) throw err;
                    resolve("1");
                })
            });
            await new Promise((resolve, reject) => {
                db.query(`UPDATE stocks SET count=count-${result[j].stock} WHERE title="${notOverStock[k]}"`,(err) => {
                    if(err) throw err;
                    resolve("1");
                })
            })
            await new Promise((resolve, reject) => {
                db.query(`UPDATE trade SET ${notOverStock[k]}Success=${result[j].stock} WHERE teamId=${result[j].teamId} && turn=${turn} && tradeType="purchase"`, (err) => {
                    if(err) throw err;
                    resolve("1");
                });
            })
        }
    }
    for( let i = 0; i<overPurStock.length; i++){
        let NumofTeam
        let result;
        let count = 0;
        await new Promise((resolve, reject) => {
            db.query(`SELECT ${overPurStock[i]} AS stock, teamId AS teamId, preCash FROM trade WHERE turn=${turn} && tradeType="purchase" ORDER BY ${overPurStock[i]}Time DESC`, (err, rows) => {
                if(err) throw err;
                result = rows.reverse();
                NumofTeam = result.length
                resolve("!");
            })
        })
        await new Promise((resolve, reject) => {
            db.query(`SELECT count FROM stocks WHERE title="${overPurStock[i]}"`, (err, countList) => {
                if(err) throw err;
                totalCount[i] = countList[0].count;
                resolve("d")
            })
        })
        for(let j = 0; j<NumofTeam; j++){
            if(totalCount[i] > count){
            await new Promise((resolve, reject) => {
  
                    count += result[j].stock;
                    if(totalCount[i] >= count){
                        db.query(`UPDATE trade SET ${overPurStock[i]}Success=${result[j].stock} WHERE teamId=${result[j].teamId} && turn=${turn} && tradeType="purchase"`, (err) => {
                            if(err) throw err;
                            db.query(`UPDATE teams SET ${overPurStock[i]}= ${overPurStock[i]} + ${result[j].stock} WHERE id=${result[j].teamId}`, (err) => {
                                if(err) throw err;
                                db.query(`UPDATE stocks SET count=count - ${result[j].stock} WHERE title="${overPurStock[i]}"`,(err) => {
                                    if(err) throw err;
                                    resolve("d")
                                })
                            })
                        }); 
                    }
                    else{
                        db.query(`UPDATE trade SET ${overPurStock[i]}Success=${result[j].stock - (count-totalCount[i])} WHERE teamId=${result[j].teamId} && turn=${turn} && tradeType="purchase"`, (err) => {
                            if(err) throw err;
                            db.query(`UPDATE teams SET ${overPurStock[i]}= ${overPurStock[i]} + ${(result[j].stock - (count-totalCount[i]))} WHERE id=${result[j].teamId}`, (err) => {
                                if(err) throw err;
                                db.query(`UPDATE stocks SET count=0 WHERE title="${overPurStock[i]}"`,(err) => {
                                    if(err) throw err;
                                    resolve("d");
                                })
                            })
                        });
                    }
                
            })}
        }
    }
    overPurStock = [];
    totalCount = [];
    overPrice = [];
    overAmount = [];
    notOverStock = [];
    notOverPrice = [];
    notOverAmount = [];
    notOverCount = [];
    return 1;
}



module.exports = buyingLogic;