// const mongoose = require('mongoose');
import mongoose from 'mongoose';
import urlModel from '../models/urlModel.js';

mongoose.set("strictQuery", false);

const dbConnect = async () => {
    try{
        // const urlModel = mongoose.model("urls", urlModel);
        urlModel.createIndexes({ userId: 1, urlCode: 1 }, { unique: true });
        await mongoose.connect(process.env.MONGO_CLOUD_URL);
        console.log("Database connected");
    }catch(error){
        console.error(error.message);
        process.exit(1);
    }
}

export default dbConnect;