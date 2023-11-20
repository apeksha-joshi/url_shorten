// const mongoose = require('mongoose');
import mongoose from 'mongoose';
import urlModel from '../models/urlModel.js';
import Tier from '../models/tierModel.js';

mongoose.set("strictQuery", false);

const dbConnect = async () => {
    try{
        urlModel.createIndexes({ userId: 1, urlCode: 1 }, { unique: true });
        await mongoose.connect(process.env.MONGO_CLOUD_URL);
        if(process.env.NODE_ENV === 'development'){
            // insert data for dev
            try{
              const tiersData = [
                { name: 'Tier1', maxRequests: 30 },
                { name: 'Tier2', maxRequests: 5 },
                { name: 'Tier3', maxRequests: 3 },
            ];
            const tiers = await Tier.insertMany(tiersData, { ordered: false });
            console.log("Data inserted successfully");
            }catch(error){
              if(error.code  === 11000){
                console.log('Duplicate key error. Data already exists.');
              }else{
                console.error("Failed to insert data in Tiers collection. Insert manually in the DB");
              }
              
            }
            
          }
    }catch(error){
        console.error(error.message);
        process.exit(1);
    }
}

export default dbConnect;