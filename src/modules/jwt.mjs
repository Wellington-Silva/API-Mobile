import { ObjectId } from 'mongodb';
import database from '../modules/db.mjs';
import vars from './vars.mjs';
import jwt from 'jsonwebtoken';

export default {
    // Login
    login: (req, res) => {
        try {
            if (req.headers.user === jwt.email && req.body.pwd === jwt.pwd) {
                const token = jwt.sign({ _id: ObjectId(_id) }, vars.secretJwt, { expiresIn: vars.expiresIn });
                return res.status(200).json({ auth: true, token });
            } else {
                res.status(401).json({ error: true, message: "E-mail ou senha inválido" });
            }
        } catch (e) {
            res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
        }
    },

    verify: (token) => {
        jwt.verify(token, vars.secretJwt, (err, decoded) => {
            if (err || !decoded) res.status(401).json({ error: true, message: "Token é inválido, tente novamente" });
            return decoded;
        });
    },

    create: (data) => {
        if (data.iat) delete data.iat;
        const token = jwt.sign(data, vars.secretJwt);
        return token;
    }
};