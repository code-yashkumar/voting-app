import express, { response } from "express";
import User from "../models/User.js";
const router=express.Router();
import { jwtAuthMiddleware, generateToken } from "../jwt.js";
import { log } from "console";
 
router.post("/signup", async(req, res) => {
    console.log(req.body);
    try { 
        const data = req.body; //assume the request body contains the person data
        const newUser = new User(data); //create a new person doc using the mongoose model

        //save the new user doc to the database
        const response = await newUser.save();
        console.log("data saved",response);

        const payload = {
            id: response.id,
            
        };
        console.log(JSON.stringify(payload));

        const token=generateToken(payload);
        console.log("Generated Token is:",token);
        res.status(200).json({response: response, token:token});
        
    } catch (err) { 
        console.log("error", err);
        res.status(500).json({ error: "Failed to save person data" });
    }
});


//login route
router.post("/login", async(req, res) => {
    try {
        //extract voterId and password from request body
        const {voterId,password}=req.body;
        // find the user by voterId
        const user=await User.findOne({voterId:voterId})
        //if user does not exist and password does not match, return error
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({error:"Invalid voterId or password"});
        }

        //generate a token for the user
        const payload={
            id:user.id
        }
        const token=generateToken(payload);
        res.json({token})

    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

//profile route
router.get("/profile", jwtAuthMiddleware, async(req, res) => {
    try {
        const userData=req.user; //get the user data from the request object
        const userId= userData.id;
        const user=await User.findById(userId);
        res.status(200).json({user});
 
    } catch (error) {
        console.error("Error during profile fetch:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


router.put('/:profile/password', jwtAuthMiddleware ,async(req,res)=>{
    try {
        const userId=req.user.id;                             //extract the id from token 
        const {curPassword,newPassword}=req.body;    //extract the old and new password from request body
        const user=await User.findOne(userId)      // find the user by userId
    
        //if password does not match, return error
        if(!(await user.comparePassword(curPassword))){
            return res.status(401).json({error:"Invalid password"});
        }

        //update the password 
        user.password=newPassword; 
        await user.save();

        console.log('data updated');
        res.status(200).json({message:"Password updated successfully"});        
    } catch (err) {
        console.log("error", err);
		res.status(500).json({ error: "Failed to fetch person data" });
    }
});
 

export default router;