import mongoose from 'mongoose';

const tierSchema = new mongoose.Schema({
    name: {
        type: String,
        required:true,
        unique:true,
        index:true,
    },
    maxRequests: {
        type:Number,
        required: true,
    },
});

tierSchema.set("toJSON", {
    virtuals: true,
    versionKey: false,
  });

export default mongoose.model('tiers', tierSchema);