import { Router } from "express";
import dataloaderRouter from "./dataloader.js";
import dataconnentRouters from "./dataconnent.js";


const routers = Router()

routers.get('/', (req, res) => {
    res.send('Hello World!')
})

routers.use("/dataloader", dataloaderRouter)
routers.use("/dataconnent", dataconnentRouters)


export default routers;