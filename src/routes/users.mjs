import { Router } from 'express';
import { ObjectId } from 'mongodb';
import jwt from '../modules/jwt.mjs';
import vars from '../modules/vars.mjs';
import database from '../modules/db.mjs';
import { createHmac, randomUUID } from "crypto";

const routes = Router();

// Login
routes.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body; // credentials

        database.db("QuestionBoxDB").collection("users").findOne({ email }, (err, result) => {
            if (err || !result) return res.status(400).json({ error: true, message: "Usuário não encontrado" });
            const hasPassword = new Boolean(result?.password);
            if (!hasPassword) {
                const tempPassword = result._id.slice(-8);
                if (password === tempPassword) return res.json({ message: "Você precisa criar uma nova senha", nextStep: "create_first_password" }).status(200);
                return res.status(200).json({ error: true, message: "Verifique suas credenciais" });
            }
            else {
                const hash = createHmac("sha256", vars.hash_secret).update(password?.toString()).digest("hex");
                if (hash === result?.password) {
                    const userJwt = {
                        _id: result._id,
                        email: result.email,
                        accessLevel: 1,
                    };
                    return res.status(200).json({
                        session: {
                            firstName: result?.firstName,
                            surname: result?.surname,
                            email: result.email,
                            accessLevel: 1,
                            token: jwt.create(userJwt),
                            ...userJwt
                        }
                    });
                }
                res.status(200).json({ error: true, message: "Senha incorreta! Tente novamente" });
            }
        });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

// Cadastrar usuário
routes.post('/signup', async (req, res) => {
    const hash = createHmac("sha256", vars.hash_secret).update(req.body.password?.toString()).digest("hex");
    try {
        const user = {
            ...req.body,
            password: hash,
            disabled: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        database.db("QuestionBoxDB").collection("users").insertOne(user, (err, result) => {
            if (err) return res.status(401).json({ error: true, message: "Não foi possível fazer o cadastro!" });
            const userJWT = {
                _id: ObjectId(result.insertedId),
                name: req.body.firstName,
                email: req.body.email,
                cpf: req.body.cpf,
                type: req.body.type,
                accessLevel: parseInt(req.body.type) == 1 ? 1 : 2
            };
            const token = jwt.create(userJWT); // Criar JWT
            res.status(201).json({ user, jwt: token });
        });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

// Detalhes do usuário
routes.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        database.db('QuestionBoxDB').collection('users').findOne({ _id: ObjectId(id) }, (err, result) => {
            if (err || !result) return res.status(404).json({ error: true, message: "Usuário não encontrado" });
            res.status(200).json(result);
        });
    } catch (e) {
        console.log("Aqui");
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

// Editar usuário
routes.put('/:id', async (req, res) => {
    try {
        const token = req.headers.authentication;
        const { _id } = jwt.validate(token);

        const { id } = req.params;
        const { changes } = req.body;
        database.db("QuestionBoxDB").collection("users").updateOne({ _id: ObjectId(id) }, { $set: { ...changes } })
            .then((result) => {
                result.modifiedCount
                    ? res.status(200).json(result)
                    : res.status(503).json({ error: true, message: "Não foi possível revogar usuário" })
            });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

// Revogar usuário
routes.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        database.db("QuestionBoxDB").collection("users").updateOne({ _id: ObjectId(id) }, { $set: { disabled: true } })
            .then((result) => {
                result.modifiedCount
                    ? res.status(200).json(result)
                    : res.status(403).json({ error: true, message: "Não foi possível revogar usuário" })
            })
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

export default routes;