const db = require("./MysqlConnect")



const fields = ["bio", "construction", "electronics", "food", "broadcast"];
async function calcAsset(id){
    let asset = 0;
    await new Promise((resolve, result) => {
        db.query(`SELECT turn FROM game`, (err, row) => {
            if(err){
                resolve("error");
            }
            let turn = row[0].turn;
            if(turn > 10){ turn = 9}
            db.query(`SELECT * FROM teams WHERE id=${id}`, (err, result) => {
                if(err){
                    resolve("error");
                } 
                for(var i = 0; i<5; i++){
                    let stock = fields[i];
                    let fieldCount = result[0][stock];
                    db.query(`SELECT * FROM prices WHERE title="${stock}" && turn=${turn}`, (err, rows) => {
                        if(err){
                            resolve("error"); 
                        }
                        asset += fieldCount * rows[0].price;
                        if(stock == "broadcast"){
                            asset += result[0].cash;
                            resolve(asset);
                        }
                    });
                }
                })
        })
        })
        db.query(`UPDATE teams SET asset=${asset} WHERE id=${id}`, (err) => {
            return asset;
        });
    }



module.exports = calcAsset;
