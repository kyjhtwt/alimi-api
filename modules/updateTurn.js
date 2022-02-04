const db = require("./MysqlConnect")

async function updateTurn() {
    let newTurn;
    let turn;
    await new Promise((resolve, reject) => {
        db.query(`SELECT * FROM game`, (err, result) => {
            if(err) throw err;
            turn = result[0].turn;
            resolve(1);
        })
    })
    await new Promise((resolve, reject) => {
        db.query(`UPDATE game SET turn=${turn + 1}`, (err, result) => {
            if(err) throw err;
            newTurn = turn + 1;
            resolve(result);
        })
    })
    return newTurn;
}


module.exports = updateTurn;