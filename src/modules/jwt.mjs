import { ObjectId } from 'mongodb';
// import database from '../modules/db.mjs';
import vars from './vars.mjs';
import jwt from 'jsonwebtoken';

export default {
    verify: (token) => {
        token = token.split("Bearer ");
        return jwt.verify(token[1], vars.secretJwt, (err, decoded) => {
            if (err || !decoded) throw { error: true, message: "Token é inválido, tente novamente" };
            return decoded;
        });
    },

    create: (data) => {
        if (data.iat) delete data.iat;
        const token = jwt.sign(data, vars.secretJwt);
        return token;
    }
};