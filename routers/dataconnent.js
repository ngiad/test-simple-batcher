import { Router } from "express";
import controller from "../controllers/dataconnent.controller.js";

const dataconnentRouters = Router()

dataconnentRouters.get('/', (req, res) => {
    res.send('đã vào dataconnentRouters')    
})  

dataconnentRouters.get('/:id',controller.getPostById)



export default dataconnentRouters;