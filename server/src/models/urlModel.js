import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
    originalLink:{
        type:String,
        required: true,
    },

    baseUrl:{
        type:String,
        required: true,
    },

    urlCode:{
        type:String,    
        required: true,
        index:true,
    },
    createdAt : {
        type:Date,
        default:Date.now,
    },
    userId : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        index: true,
    },
});

urlSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
  });

export default mongoose.model("Urls", urlSchema);