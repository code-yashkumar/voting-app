import mongoose from "mongoose";
// import bcrypt from "bcrypt"

const CandidateSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    age:{
        type:Number
    },
    party:{
        type:String,
        required:true
    },
    votes:[
        {user:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required:true
        },
        votedAt:{
            type:Date,
            default: Date.now
        }}
    ],
    votesCount:{
        type:Number,
        default:0
    }
}) 

const Candidate= mongoose.model('Candidate',CandidateSchema)

export default Candidate 