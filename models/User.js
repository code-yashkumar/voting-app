import mongoose from "mongoose";
import bcrypt from "bcrypt"

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    age:{
        type:Number
    },
    mobile:{
        type:String,
        sparse:true,
        unique:true

    },
    email:{
        type:String,
        unique:true,
        sparse: true
    },
    address:{
        type:String,
        required:true
    },
    voterId:{
        required:true,
        type:Number
    },
    password:{
        required:true,
        type:String,
        unique:true 
    },
    role:{
        type: String,
        enum:["voter","admin"],
        default: "voter"
    },
    isVoted:{
        type:Boolean,
        default:false
    }
}) 


userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword= async function(candidatePassword){
    try {
        const isMatch=await bcrypt.compare(candidatePassword,this.password);
        return isMatch
    } catch (error) {
        throw error;
    }
}



const user= mongoose.model('user',userSchema)

export default user