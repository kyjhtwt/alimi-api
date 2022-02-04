const express = require("express");
const router = express.Router();

const db = require("../modules/MysqlConnect.js")
const assetUpdate = require("../modules/calcAsset")
const getAUP = require("../modules/calcAverageUnitPrice")


router.get("/", (req, res) => {     // get all teams
    db.query(`SELECT id FROM teams`, (err, rows, fields) => {
        if(err) throw err;
        if(rows.length == 0) res.send([]);
        for(let i = 0; i<rows.length; i++){
            assetUpdate(rows[i].id);
            if(i == rows.length-1){
                db.query(`SELECT * FROM teams`, (err, result) => {
                    if(err) throw err;
                    res.send(result);
                })
            }
        }
    });
});

router.post("/", (req, res) => {    // Add a new team 
    db.query(`SELECT id FROM teams ORDER BY id DESC`, (err, result) => {
        if(result.length == 0){
            db.query(`INSERT INTO teams (id, cash, bio, electronics, construction, food, broadcast, asset) VALUES (0,'0', '0', '0', '0', '0', '0', '0')`, (err) => {
                if(err) throw err;
                res.send("success");
            });
        }
        else{
            let new_id = result[0].id + 1;
            db.query(`INSERT INTO teams (id, cash, bio, electronics, construction, food, broadcast, asset) VALUES (${new_id},'0', '0', '0', '0', '0', '0', '0')`, (err) => {
                if(err) throw err;
                res.send("success");
            });
        }
    })
});

router.get("/cash", (req, res) => { // send all team's cash in Ascending order
    db.query(`SELECT id, cash FROM teams ORDER BY cash DESC`, (err, rows, fields) => {
        if(err) throw err;
        let money = [];
        let ids = [];
        for(let i = 0; i<rows.length; i++){
            money.push(rows[i].cash);
            ids.push(rows[i].id);
        }
        let data = { "id" : ids, "cash" : money}
        res.send(data);
    });
});

router.get("/AverageUnitPrice", (req, res) => {
    id = req.query.teamId;
    field = req.query.field;
    async function AUP(){
        let P = await new Promise((resolve, reject) => {
            resolve(getAUP(id, field));
        })
        res.send({"AverageUnitPrice":P});
    }
    AUP();
})

router.get("/:id", (req, res) => {  // send info about a team which id = ${id}
        id = req.params.id;
        async function assetUp(){
            await new Promise((resolve, reject) => {
                resolve(assetUpdate(id))
            })
            db.query(`SELECT * FROM teams WHERE id=${id}`, (err, result) => {
                res.send(result[0]);
            });
        }
       assetUp();
})

router.post("/:id", (req, res) => {    // Add a new team 
    const id = req.params.id;
    const body = req.body;
    db.query(`INSERT INTO teams (id, cash, bio, electronics, construction, food, broadcast, asset) VALUES (${id},${body.cash}, ${body.bio}, ${body.electronics}, ${body.construction}, ${body.food}, ${body.broadcast}, 0)`, (err) => {
        if(err) throw err;
        res.send("success");
    });
});

router.get("/:id/:finding", (req, res) => { // get fields of "finding" where the id = ${id}
    id = req.params.id;
    finding = req.params.finding;
    db.query(`SELECT ${finding} FROM teams WHERE id=${id}`, (err, result) => {
        if(err) throw err;
        finding = { "count": result[0][finding]};
        res.send(finding);
    });
});

router.put("/:id", (req, res) => {  // update all columns of a team which id = ${id}
    body = req.body;
     db.query(`UPDATE teams SET cash=${body.cash}, bio=${body.bio}, electronics=${body.electronics}, construction=${body.construction}, food=${body.food}, broadcast=${body.broadcast} WHERE id=${req.params.id}`, (err, result) => {
            if (err) throw (err);
            assetUpdate(req.params.id)
            res.send("success");
        });
    }
)

router.put("/:id/:finding", (req, res) => {    // update ${finding} column of teams which id = ${id}
    id = req.params.id;
    body = req.body;
    finding =req.params.finding;
    if(finding=="cash" && body.cash !== undefined){
        db.query(`UPDATE teams SET ${finding}=${body.cash} WHERE id=${id}`, (err, result) =>{
            if(err) throw(err);
            assetUpdate(req.params.id);
            res.send("success");
        });
    }
    else if(finding=="bio" && body.bio !== undefined){
        db.query(`UPDATE teams SET ${finding}=${body.bio} WHERE id=${id}`, (err, result) =>{
            if(err) throw(err);
            assetUpdate(req.params.id)
            res.send("success");
        });
    }
    else if(finding=="electronics" && body.electronics !== undefined){
        db.query(`UPDATE teams SET ${finding}=${body.electronics} WHERE id=${id}`, (err, result) =>{
            if(err) throw(err);
            assetUpdate(req.params.id)
            res.send("success");
        });
    }
    else if(finding=="construction" && body.construction !== undefined){
        db.query(`UPDATE teams SET ${finding}=${body.construction} WHERE id=${id}`, (err, result) =>{
            if(err) throw(err);
            assetUpdate(req.params.id)
            res.send("success");
        });
    }
    else if(finding=="food" && body.food !== undefined){
        db.query(`UPDATE teams SET ${finding}=${body.food} WHERE id=${id}`, (err, result) =>{
            if(err) throw(err);
            assetUpdate(req.params.id)
            res.send("success");
        });
    }
    else if(finding=="broadcast" && body.broadcast !== undefined){
        db.query(`UPDATE teams SET ${finding}=${body.broadcast} WHERE id=${id}`, (err, result) =>{
            if(err) throw(err);
            assetUpdate(req.params.id)
            res.send("success");
        });
    }
    else{
        err = "There is no such object in teams";
        res.send("fail");
        throw(err);
    }
})

router.delete("/:id", (req, res) => {
    let id = req.params.id;
    db.query(`DELETE FROM teams WHERE id=${id}`, (err, result) => {
        if(err) throw err;
        res.send(result);
    });
})

router.delete("/", (req, res) => {
    db.query('TRUNCATE teams');
    res.send("All teams deleted")
})

/**
*  @swagger
*  tags:
*    name: teams
*    description: API to manage teams.
*/
/**
*   @swagger
*  paths:
*   /teams:
*     get:
*       summary: List all teams
*       tags: [teams]
*       responses:
*         "200":
*           description: The list of teams.
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/teams'
*     post:
*       summary: post another basic team
*       tags: [teams]
*       responses:
*         "200":
*           description: insert to database a basic team which has all 0 in its entry except for id.
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/teams'
*     delete:
*       summary: delete all teams
*       tags: [teams]
*       responses:
*         "200":
*           description: delete all teams. 
*/

/**   
* @swagger
*  paths:
*   /teams/{id}:
*     get:
*       summary: List properties of a team which has {id}
*       tags: [teams]
*       parameters:
*           - in: path
*             name: id
*             description: id of team trying to find
*             required: true
*             schema:
*               type: integer
*       responses:
*         "200":
*           description: The list of teams.
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/teams'
*     post:
*         summary: post a tema with all properties of the team (except for asset)
*         tags: [teams]
*         parameters:
*           - in: path
*             name: id
*             description: id of team trying to post
*             required: true
*             schema:
*               type: integer
*         requestBody:
*             required: true
*             content:
*               application/json:
*                   schema:
*                       $ref: '#/components/schemas/putTeams'
*     put:
*         summary: update all properties of the team
*         tags: [teams]
*         parameters:
*           - in: path
*             name: id
*             description: id of team trying to find
*             required: true
*             schema:
*               type: integer
*         requestBody:
*             required: true
*             content:
*               application/json:
*                   schema:
*                       $ref: '#/components/schemas/putTeams'
*         responses:
*           "200":
*               description: The list of teams.
*               content:
*                   application/json:
*                       schema:
*                           $ref: '#/components/schemas/teams'
*     delete:
*       summary: delete a team which has {id}
*       tags: [teams]
*       parameters:
*           - in: path
*             name: id
*             description: id of team trying to delete
*             required: true
*             schema:
*               type: integer
*       responses:
*         "200":
*           description: The list of teams.
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/teams'          
*/

/**   
* @swagger
*  paths:
*   /teams/{id}/{property}:
*     get:
*       summary: get a property of a team which has {id} id 
*       tags: [teams]
*       parameters:
*           - in: path
*             name: id
*             description: id of team trying to find
*             required: true
*             schema:
*               type: integer
*           - in: path
*             name: property
*             description: property of the team trying to find
*             required: true
*             schema:
*               type: string
*       responses:
*         "200":
*           description: The list of teams.
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/teams'
*     put:
*         summary: update a property of the team
*         tags: [teams]
*         parameters:
*           - in: path
*             name: id
*             description: id of team trying to update
*             required: true
*             schema:
*               type: integer
*           - in: path
*             name: property
*             description: property of the team trying to update
*             required: true
*             schema:
*               type: string
*         requestBody:
*             required: true
*             content:
*               application/json:
*                   schema:
*                       $ref: '#/components/schemas/putTeams'
*         responses:
*           "200":
*               description: The list of teams.
*               content:
*                   application/json:
*                       schema:
*                           $ref: '#/components/schemas/teams'          
*/

/**   
* @swagger
*  paths:
*   /teams/cash:
*     get:
*       summary: Lists all teams in descending order for cash
*       tags: [teams]
*       responses:
*         "200":
*           description: The list of teams in descending order for cash.
*           content:
*             application/json:
*               schema:
*                 $ref: '#/components/schemas/teams'
*/

/**   
* @swagger
*  paths:
*   /teams/AverageUnitPrice:
*     get:
*       summary: get AverageUnitPrice of a team for a specific field of stock
*       tags: [teams]
*       parameters:
*           - in: query
*             name: teamId
*             description: id of team trying to find
*             required: true
*             schema:
*               type: integer
*           - in: query
*             name: field
*             description: field of stock
*             required: true
*             schema:
*               type: string
*       responses:
*         "200":
*           description: converted price 
*
*/

module.exports = router;