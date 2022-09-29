import { ObjectId } from 'mongodb';
// import database from '../modules/db.mjs';
import vars from './vars.mjs';
import jwt from 'jsonwebtoken';

export default {
    login: (user, pwd) => {
        try {
            if (user === jwt.email && pwd === jwt.pwd) {
                const token = jwt.sign({ _id: ObjectId(_id) }, vars.secretJwt, { expiresIn: vars.expiresIn });
                return { auth: true, token };
            } else {
                return { error: true, message: "E-mail ou senha inválido" };
            }
        } catch (e) {
            return { error: true, message: e.message || "Houve um erro interno no servidor" };
        }
    },

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