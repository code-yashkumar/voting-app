import express from "express";
const router = express.Router();
import User from "../models/User.js";
import Candidate from "../models/Candidate.js";
import { jwtAuthMiddleware } from "../jwt.js";

//check admin role
const checkAdminRole=async (userId)=>{
    try {
        const user=await User.findById(userId);
        return user && user.role==="admin"
    } catch (err) {
        return false; 
    }
}    

//post route to add a new candidate
// http://localhost:3000/Candidate
router.post('/', jwtAuthMiddleware,async (req, res) => {
    try {
        if (!(await checkAdminRole(req.user.id))) {
            console.log("Access denied: User is not an admin");
            return res.status(403).json({ message: "Access denied: User is not an admin" });
        }
        const data=req.body  //asumming body contains the candidate data
        const newCandidate= new Candidate(data); //create a new candidate doc using the mongoose model  
        const response=await newCandidate.save(); //save the new candidate doc to the database
        console.log("data saved");
        res.status(200).json(response); 
        
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to save candidate data" });
        
    }
})

//UPDATE candidate route
router.put('/:candidateId',jwtAuthMiddleware,async(req,res)=>{
    try {
        if(!(await checkAdminRole(req.user.id))) return res.status(403).json({message:"Access denied"});
        const candidateId=req.params.candidateId;
        const updatedCandidateData = req.body;
        const response=await Candidate.findByIdAndUpdate(candidateId,updatedCandidateData,{
            new:true,
            runValidators:true
        })

        if(!response){
            return res.status(404).json({error:'Candidate not found'})
        }

        console.log('candidate data updated');
        res.status(200).json(response);
    } catch (err) {
        console.log("error", err);
		res.status(500).json({ error: "Failed to update candidate data" });
    }
});



//DELETE candidate route
router.delete('/:candidateId',jwtAuthMiddleware,async(req,res)=>{
    try {
        if(!(await checkAdminRole(req.user.id))) return res.status(403).json({message:"Access denied"});
        const candidateId=req.params.candidateId;
        const response=await Candidate.findByIdAndDelete(candidateId)
        if(!response){
            return res.status(404).json({error:'Candidate not found'})
        }
        console.log('candidate data deleted');
        res.status(200).json({"Candidate deleted successfully":response});
        
    } catch (err) {
        console.log("error", err);
		res.status(500).json({ error: "Failed to delete candidate data" });
    }
});


//voting route
router.post('/vote/:candidateId', jwtAuthMiddleware, async(req,res)=>{
    // no admin can vote
    // user can vote only once

    const candidateId = req.params.candidateId;
    const userId = req.user.id;

    try {
        const candidate= await Candidate.findById(candidateId);
        if(!candidate){
            return res.status(404).json({error:"Candidate not found"});
        }
        const user=await User.findById(userId);
        if(!user) return res.status(404).json({error:"User not found"});
        if(user.isVoted) return res.status(400).json({error:"User has already voted"});
        if(user.role==="admin") return res.status(403).json({error:"Admin cannot vote"});

        //update candidate votes
        candidate.votes.push({user:userId});
        candidate.votesCount++;
        await candidate.save();

        //update user isVoted status
        user.isVoted=true;
        await user.save();

        res.status(200).json({message:"Vote cast successfully"});

    } catch (err) {
        console.log("error", err);
		res.status(500).json({ error: "Failed to cast vote" });
    }
})


//vote count route
router.get('/vote/count', async(req,res)=>{
    try {
        //find all candidates and sort them by voteCount in descending order
        const candidates=await Candidate.find().sort({votesCount:'desc'});

        //map the candidates to return only the name and voteCount
        const voteRecord=candidates.map(candidate=>({
            party: candidate.party,
            count: candidate.votesCount
        }));
        return res.status(200).json(voteRecord);

    } catch (err) {
        console.log("error", err);
        res.status(500).json({ error: "Failed to get vote count" });
    }
})

//get all candidates route
router.get('/', async(req,res)=>{
    try {
        const candidates = await Candidate.find().select('-votes -votesCount');
        res.status(200).json(candidates);
    } catch (err) {
        console.log("error", err);
        res.status(500).json({ error: "Failed to get candidates" });
    }
});

export default router;