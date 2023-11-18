import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName : {
        type:String,
        requires:true,
    },
    lastName : {
        type:String,
        requires:true,
    },
    email : {
        type:String,
        requires:true,
        unique:true,
        index:true,
    },
    password : {
        type:String,
        requires:true,
    },
    resetToken: {
        type: String,
        default: "",
    },
    refreshToken : {    
        type: String,
        default: "",
    },
    tier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'tiers',
        required: true,
    },
    requestCount : {
        type:Number,
        default:0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    lastLoginDate: {
        type: Date,
        default: null,
    },
});


userSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
  });


export default mongoose.model("Users", userSchema);
