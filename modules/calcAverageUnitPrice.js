const db = require("./MysqlConnect")

async function calcAUP(id, field){
    let prices;
    let turn;
    let total = 0;
    let amount = 0;
    let zero = 0;
    await new Promise((resolve, result) => {
        db.query(`SELECT turn FROM game`, (err, result) => {
            if(err) throw err;
            turn = result[0].turn;
            resolve(turn);
        })
    })
    if(turn == 1){
        return 0;
    };
    await new Promise((resolve, reject) => {
        db.query(`SELECT ${field} FROM teams WHERE id=${id}`, (err, result) => {
            if(err) throw err;
            if(result[0][field] == 0){
                zero = 1;
            }
            resolve(1);
        });
    })
    if(zero == 1){
        return 0;
    }
    await new Promise((resolve, result) => {
        db.query(`SELECT * FROM prices WHERE title="${field}" && turn<${turn} ORDER BY turn`, (err, result) => {
            if(err) throw err;
            prices = result;
            resolve(prices);
            });
    })
    await new Promise((resolve, result) => {
        db.query(`SELECT ${field}Success, turn FROM trade WHERE teamId=${id} && turn<${turn} && tradeType="purchase" ORDER BY turn`, (err, result) => {
            if(err) throw err;
            if(result.length == 0) resolve(0);
            for(let i = 0; i<result.length; i++){
                amount += result[i][field+"Success"];
                total += prices[result[i].turn-1].price * result[i][field+"Success"];
                if(i == result.length-1) resolve(total);    
            }
        })
    });

    if(total == 0 && amount == 0) return 0;

    return Number((total/amount).toFixed(2));
}

module.exports = calcAUP