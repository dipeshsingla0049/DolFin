require('dotenv').config()
const express = require("express")
const router = express.Router()
const {market_price,statistics} = require("../services/data_service")

router.use(express.json())
data_key = process.env.DATA_KEY


// router used to fetch data from the api
router.get("/fetch/:id",async (req,res)=>{

    // validates selected company
    let id = req.params.id
    if(!id){
        return res.status(401).json({"message" : "invalid ticker"})
    }

    // fetches market price
    let mkt_price = await market_price(id,data_key)
    mkt_price = await mkt_price.json()

    // fetches company statsitics
    let stats = await statistics(id,data_key)    
    stats = await stats.json()
    
})