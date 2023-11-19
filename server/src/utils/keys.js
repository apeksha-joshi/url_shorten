import dotenv from 'dotenv';
import path from 'path';

console.log(path.resolve(`../../server/.env.${process.env.NODE_ENV}`));
dotenv.config({
    path :  path.resolve(`../../server/.env.${process.env.NODE_ENV}`)
});
//dotenv.config();
export const SESSION_SECRET = process.env.SESSION_SECRET;
export const JWT_SECRET = process.env.JWT_SECRET;