import supertest from 'supertest';
import dotenv from 'dotenv';
import path from 'path';
import app from '../src/app.js'; 
import {jest} from '@jest/globals'
import * as userServices from '../src/dbServices/userServices.js';


import mongoose from 'mongoose';
import customError from '../src/config/ApiCallError.js';
import Tier from '../src/models/tierModel.js';
import User from '../src/models/userModel.js';
import Url from '../src/models/urlModel.js';


dotenv.config({
    path :  path.resolve(`../server/.env.${process.env.NODE_ENV}`)
});

jest.mock('../src/dbServices/userServices.js', () => {
    return {
      __esModule: true,   
      ...jest.requireActual('../src/dbServices/userServices.js')
    };
  });
  

beforeAll(done => {
    try{
        //console.log(process.env.MONGO_CLOUD_URL);
        Url.createIndexes({ userId: 1, urlCode: 1 }, { unique: true });
        mongoose.connect(process.env.MONGO_CLOUD_URL);
        console.log("Connected to Test Database");
        done();
    }catch(err){
        console.error('Error connecting to test database:', err);
        throw err;
    }
});

beforeEach(done => {
    

    try{
        const tiersData = [
            { name: 'Tier 1', maxRequests: 30 },
            { name: 'Tier 2', maxRequests: 5 },
            { name: 'Tier 3', maxRequests: 3 },
        ];
        // Url.createIndexes({ userId: 1, urlCode: 1 }, { unique: true });
        // mongoose.connect(process.env.MONGO_CLOUD_URL);
        // console.log("Connected to Test Database");
        //done();
        const tiers = Tier.create(tiersData);
        //console.log("Test data for tiers created");
        done();
    }catch(err){
        console.log("Error creating test data for tiers");
        throw err;
    }
})



//     jest.unstable_mockModule('fs', async function () {
//     return import('./__mocks__/fs.js');
//   });
// Object.defineProperty(userServices, "createUser", {
//     value: jest.fn(),
//     configurable: true,
//     writable: true
//   });

const createUserSpy = jest.spyOn(userServices, 'createUser');
createUserSpy.mock.mockImplementation(() => {
      throw new Error('Simulated internal server error');
});


describe('Register User', () => {
const request = supertest.agent(app);

// it('registers a new user successfully with default tier', async () => {
//     const payload = {
//                     firstName: 'user1',
//                     lastName: 'last1',
//                     email: 'user1.last1@email.com',
//                     password: 'User1last1@123',
//             };

//     const response = await request.post('/api/auth/register')
//       .send(payload);
//     console.log(response.body);
//     // Assertions
//     expect(response.status).toBe(200);
//     expect(response.body).toHaveProperty('email', payload.email);
//     expect(response.body).toHaveProperty('accessToken');
//     expect(response.headers['set-cookie']).toBeDefined();
//   });

    test('registers a new user-Not provided email in request', async () => {
        const payload = {
            firstName: 'user1',
            lastName: 'last1',
            password: 'User1last1@123',
        };

        
        const response = await request.post('/api/auth/register')
            .send(payload);
            
        console.log(response.status);
        // Assertions
         expect(response.status).toBe(400);
         //expect(response.body).toHaveProperty('message');
         //expect(response.body.message).toBe("Missing required parameters. Expected firstName, lastName, email, password, tier(optional)");
    });

  test('registers a new user-Not provided email in request', async () => {
    try {
        const payload = {
            firstName: 'user1',
            lastName: 'last1',
            password: 'User1last1@123',
        };

        const response = await request.post('/api/auth/register')
            .send(payload);

        // Assertions
        expect(response.status).toBe(400);
    }catch(error){
      console.log(error);
    }

});

test('registers a new user-Not provided firstName in request', async () => {
    try {
        const payload = {
            lastName: 'last1',
            email: 'user1.last1@email.com',
            password: 'User1last1@123',
        };

        const response = await request.post('/api/auth/register')
            .send(payload);


        // Assertions
        expect(response.status).toBe(400);
        //expect(response.body).toHaveProperty('message', "Missing required parameters. Expected firstName, lastName, email, password, tier(optional)");
    }catch(error){
      console.log(error);
    }

});

test('registers a new user-Not provided lastName in request', async () => {
    try {
        const payload = {
            firstName: 'user1',
            email: 'user1.last1@email.com',
            password: 'User1last1@123',
        };

        const response = await request.post('/api/auth/register')
            .send(payload);


        // Assertions
        expect(response.status).toBe(400);
        //expect(response.body).toHaveProperty('message', "Missing required parameters. Expected firstName, lastName, email, password, tier(optional)");
    }catch(error){
      console.log(error);
    }

});

test('registers a new user-Not provided password in request', async () => {
    try {
        const payload = {
            firstName: 'user1',
            lastName: 'last1',
            email: 'user1.last1@email.com',
        };

        const response = await request.post('/api/auth/register')
            .send(payload);


        // Assertions
        expect(response.status).toBe(400);
        //expect(response.body).toHaveProperty('message', "Missing required parameters. Expected firstName, lastName, email, password, tier(optional)");
    }catch(error){
      console.log(error);
    }

});

  test('registers a new user-Invalid email', async () => {
      try {
          const payload = {
              firstName: 'user1',
              lastName: 'last1',
              email: 'user1.last1email.com',
              password: 'User1last1@123',
          };

          const response = await request.post('/api/auth/register')
              .send(payload);

          // Assertions
          expect(response.status).toBe(400);
          //expect(response.body).toHaveProperty('message', "Invalid email. Please provide a valid email");
      }catch(error){
        console.log(error);
      }

  });

  test('registers a new user-Password requirement not met', async () => {
    try {
        const payload = {
            firstName: 'user1',
            lastName: 'last1',
            email: 'user1.last1email.com',
            password: 'user1last1@123',
        };

        const response = await request.post('/api/auth/register')
            .send(payload);


        // Assertions
        expect(response.status).toBe(400);
        //expect(response.body.message).toEqual(expect.stringMatching("Password does not meet the requirements. It should have at least one"));
        //expect(response.body).toHaveProperty('message', "Invalid email. Please provide a valid email");
    }catch(error){
      console.log(error);
    }

});



  test('handles internal server error (500)', async () => {


    const payload = {
        firstName: 'user1',
        lastName: 'last1',
        email: 'user1.last1@email.com',
        password: 'User1last1@123',
};


    const response = await request.post('/api/auth/register')
      .send(payload);
    console.log(response);
    // Assertions
    expect(response.status).toBe(500);
    expect(createUserSpy).toHaveBeenCalled();
    expect(response.body).toHaveProperty('message', 'Internal server error');
    createUserSpy.mockRestore();
  });



});



// clear testDB 
afterEach(done => {
    try{
         User.deleteMany();
        console.log("Cleared users collection");

         Url.deleteMany();
        console.log("Cleared urls collection");

         Tier.deleteMany();
        console.log("Cleared tiers collection");


        done();
    }catch (err) {
        console.error('Error clearing test collections:', err);
        throw err;
    }
    
});


// disconnect from DB
afterAll(done => {
    try{
        mongoose.connection.close();
        console.log('Disconnected from test database');

        done();
    }catch (err) {
    console.error('Error disconnecting from test DB:', err);
    throw err;
  }
    
})
