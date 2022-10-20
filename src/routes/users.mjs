import { Router } from 'express';
import { ObjectId } from 'mongodb';
import database from '../modules/db.mjs';
import jwt from '../modules/jwt.mjs';
import { createHmac, randomUUID } from "crypto";

const routes = Router();

// Login
routes.get('/login/:email/:pwd', async (req, res) => {
    try {
        const { user, pwd } = req.params; // credentials

        const conn = await database.connection();
        conn.db("QuestionBoxDB").collection("users").findOne({ email }, (err, result) => {
            if (err || !result) return res.status(400).json({ error: true, message: "Usuário não encontrado" });
            const hasPassword = new Boolean(result?.password);
            conn?.close();
            if (!hasPassword) {
                const tempPassword = result._id.slice(-8);
                if (password === tempPassword) return res.status(200).json({ message: "Você precisa criar uma nova senha", nextStep: "create_first_password" });
                return res.status(200).json({ error: true, message: "Verifique suas credenciais" });
            }
            else {
                const hash = createHmac("sha256", vars.hash_secret).update(password?.toString()).digest("hex");
                if (hash === result?.password) {
                    const jwt = {
                        _id: result._id,
                        email: result.email,
                        accessLevel: 2,
                    }
                    return res.status(200).json({
                        session: {
                            firstName: result?.firstName,
                            surname: result?.surname,
                            email: result.email,
                            accessLevel: 2,
                            token: jwt.create({ ...jwt }),
                            ...jwt
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

// Detalhes do usuário
routes.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        database.db('QuestionBoxDB').collection('users').findOne({ _id: ObjectId(id) }, (err, result) => {
            if (err || !result) return res.status(404).json({ error: true, message: "Usuário não encontrado" });
            res.status(200).json(result);
            database.close();
        });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

// Listar usuários
routes.get('/', async (req, res) => {
    try {
        database.db('QuestionBoxDB').collection('users').find({ disabled: false })
            .toArray((err, result) => {
                if (err || !result) return res.status(501).json({ error: true, message: "Usuário não encontrado" });
                res.status(200).json(result);
                database.close();
            });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

// Cadastrar usuário
routes.post('/', async (req, res) => {
    try {
        const user = {
            ...req.body,
            disabled: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        database.db("QuestionBoxDB").collection("users").insertOne(user, (err, result) => {
            if (err) throw { error: true, message: "Não foi possível realizar a pergunta" };
            const userJWT = {
                _id: ObjectId(result.insertedId),
                firstName: req.body.firstName,
                surname: req.body.surname,
                email: req.body.email,
                password: req.body.password,
                cpf: req.body.cpf,
                type: req.body.type,
                accessLevel: parseInt(req.body.type) == 1 ? 1 : 2
            };
            const token = jwt.create(userJWT); // Criar JWT
            res.status(201).json({ user, jwt: token });
            database.close();
        });
    } catch (e) {
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
                    : res.status(503).json({ error: true, message: "Não foi possível revogar usuário" })
            })
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

export default routes;