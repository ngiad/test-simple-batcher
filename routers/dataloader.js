import { Router } from "express";
import controller from "../controllers/dataloader.controller.js";


const dataloaderRouter = Router()
dataloaderRouter.get('/', (req, res) => {
    res.send('đã vào dataloaderRouter')    
})  

dataloaderRouter.get('/:id',controller.getPostById)


export default dataloaderRouter;