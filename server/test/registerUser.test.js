// const chai = require('chai');
// process.env.NODE_ENV = 'test';
import chai from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import supertest from 'supertest';
// import mongoose from 'mongoose';
// import dotenv from 'dotenv';
import chaiHttp from 'chai-http';
// import * as chaiHttp from 'chai-http'
// import path from 'path';
// import fs from 'fs';
import app from '../src/app.js'; 
// import Tier from '../src/models/tierModel.js';
// import User from '../src/models/userModel.js';
// import Url from '../src/models/urlModel.js';
import {findDefaultTier} from '../src/dbServices/tierServices.js'
import {findUserByEmail} from '../src/dbServices/userServices.js'
import * as userService from '../src/dbServices/userServices.js';

// chaiHttp = require('chai-http');
const expect = chai.expect;

const should = chai.should();
chai.use(chaiHttp);




// describe('First Test', function() {

//     const request = supertest.agent(app);
//     it('test default Route', async ()=> {

//         const res = await request.get('/api/welcome')
//         // .end((err, res)=> {
//             //console.log(res);
//             expect(res.status).to.equal(200);
//             //res.should.have.status(200);
//             //done();
//         // })
        
//     })
// })


describe('Register User API', () => {
    //chai.use(chaiHttp);
    //const request = supertest.agent(app);
    // success with default tier
    it("should register a new user(default tier) successfully", (done)=> {
        const payload = {
            firstName: 'user1',
            lastName: 'last1',
            email: 'user1.last1@email.com',
            password: 'User1last1@123',
    };
        //const res = request.post('/api/auth/register').send(payload);
        chai.request(app).post('/api/auth/register')
        .send(payload)
        .set('Accept', 'application/json')
        //.expect(200)
        .end(async (err, res)=> {
            try{
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object')
                expect(res.body).to.have.property('email').to.equal(payload.email)
                expect(res.body).to.have.property('accessToken').that.is.not.empty;
                expect(res.header['set-cookie']).to.be.an('array').that.is.not.empty;

                // Check for the 'jwt' cookie
                const jwtCookie = res.header['set-cookie'].find(cookie => cookie.startsWith('jwt'));
                expect(jwtCookie).to.exist;
                expect(jwtCookie).to.not.be.empty;

                // check if user has the default tier
                
                const defaultTier = await findDefaultTier();
                const existingUser =  await findUserByEmail(payload.email);
                expect(existingUser).to.have.property('tier');
                expect(existingUser.tier.toString()).to.equal(defaultTier._id.toString());
            done();
            }catch(error){
                done(error);
            }
            
        });
    });

    // check of internal error while creating a user 
    it("should handle internal server error from createUser function", (done)=> {
        const payload = {
            firstName: 'user1',
            lastName: 'last1',
            email: 'user1.last1@email.com',
            password: 'User1last1@123',
    };
        const createUserStub = proxyquire('../src/dbServices/userServices.js', {
            '../src/dbServices/userServices.js' : {
                createUser : sinon.stub(),
            },
        })
        //sinon.stub(userService, 'createUser');
        createUserStub.rejects(new Error("Simulated Internal server error"));

        //const res = request.post('/api/auth/register').send(payload);
        chai.request(app).post('/api/auth/register')
        .send(payload)
        .set('Accept', 'application/json')
        .end(async (err, res)=> {
            try{
                expect(res).to.have.status(500);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.property('message').that.includes('Internal server error');
                createUserStub.restore();
            done();
            }catch(error){
                done(error);
            }
            
        });
    });

    // email missing
    // firstName missing
    // lastName missing
    // invalid email
    // invalid password - length
    // invalid password - no number
    // invalid password - no symbol
    // invalid password - no  uppercase
    // invalid password - no lowercase
    // user with this email already exists
    // generate 500 error from createuser
    // generate 500 from getAuthToken
    // success specifc tier
});


// // clear testDB 
// afterEach(async() => {
//     try{
//         await User.deleteMany();
//         console.log("Cleared users collection");

//         await Url.deleteMany();
//         console.log("Cleared urls collection");

//         await Tier.deleteMany();
//         console.log("Cleared tiers collection");
//     }catch (err) {
//         console.error('Error clearing test collections:', err);
//         throw err;
//     }
    
// });


// // disconnect from DB
// after(async() => {
//     try{
//         await mongoose.connection.close();
//         console.log('Disconnected from test database');
//     }catch (err) {
//     console.error('Error disconnecting from test DB:', err);
//     throw err;
//   }
    
// })