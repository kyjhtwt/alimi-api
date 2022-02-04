const db = require("./MysqlConnect")


async function posting(req, body, price){
        
        await new Promise((resolve, reject) => {
            db.query(`INSERT INTO stocks (title, count) VALUES ("${req.params.field}", ${body.count})`, (err) => {
                if(err) throw err;
                resolve(1)
        })})
        for(let i = 0; i<price.length; i++){
            await new Promise((resolve, reject) => {
                db.query(`INSERT INTO prices (price, title, turn) VALUES (${price[i]}, "${req.params.field}", ${i+1})`, (err) => {
                    if(err) throw err;
                    resolve(1)
                });
            })
        }
    return 0;
}

module.exports = posting