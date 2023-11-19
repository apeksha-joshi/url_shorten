// const chai = require('chai');
process.env.NODE_ENV = 'test';
import chai from 'chai';
import supertest from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import app from '../src/app.js'; 
import Tier from '../src/models/tierModel.js';
import User from '../src/models/userModel.js';
import Url from '../src/models/urlModel.js';


const expect = chai.expect;

const should = chai.should();


dotenv.config({
    path :  path.resolve(`../server/.env.${process.env.NODE_ENV}`)
});


export const mochaHooks =   {

    beforeAll: async () => {
        console.log("Connect to test db")
        try {
            Url.createIndexes({ userId: 1, urlCode: 1 }, { unique: true });
            await mongoose.connect(process.env.MONGO_CLOUD_URL);
            console.log("Connected to Test Database");
        } catch (err) {
            console.error('Error connecting to test database:', err);
            throw err;
        }
    },

    beforeEach: async () => {
        const tiersData = [
            { name: 'Tier 1', maxRequests: 30 },
            { name: 'Tier 2', maxRequests: 5 },
            { name: 'Tier 3', maxRequests: 3 },
        ];

        try {
            const tiers = await Tier.insertMany(tiersData, { ordered: false });
            console.log("Test data for tiers created");
        } catch (err) {
            console.log("Error creating test data for tiers");
            throw err;
        }
    },

    // clear testDB 
    afterEach: async() => {
        try{
            await User.deleteMany();
            console.log("Cleared users collection");

            await Url.deleteMany();
            console.log("Cleared urls collection");

            await Tier.deleteMany();
            console.log("Cleared tiers collection");
        }catch (err) {
            console.error('Error clearing test collections:', err);
            throw err;
        }

    },
    afterAll : async () => {
        try {
            await mongoose.connection.close();
            console.log('Disconnected from test database');
        } catch (err) {
            console.error('Error disconnecting from test DB:', err);
            throw err;
        }

    }
}
