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


// userSchema.pre('save', async function (next) {
//     // Use the hashPassword utility to hash the user's password before saving
//     if (this.isModified('password')) {
//       this.password = await hashPassword(this.password);
//     }
//     next();
//   });
  
//   userSchema.methods.comparePassword = async function (candidatePassword) {
//     // Use the comparePassword utility to check if the provided password matches the hashed password
//     return comparePassword(candidatePassword, this.password);
//   };

export default mongoose.model("users", userSchema);
