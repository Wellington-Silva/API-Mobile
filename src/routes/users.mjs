import { Router } from 'express';
import { ObjectId } from 'mongodb';
import database from '../modules/db.mjs';
import jwt from '../modules/jwt.mjs';

const routes = Router();

// Detalhes do usuário
routes.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        database.db('QuestionBoxDB').collection('users').findOne({ _id: ObjectId(id) }, (err, result) => {
            if (err || !result) return res.status(501).json({ error: true, message: "Usuário não encontrado" });
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
            })
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
                firstName: user.firstName,
                surname: user.surname,
                email: user.email,
                cpf: user.cpf,
                type: user.cpf,
                accessLevel: parseInt(req.body.type) == 1 ? 1 : 2
            };
            console.log(userJWT.accessLevel)
            const token = jwt.create(userJWT); //criar jwt
            res.status(201).json({ user, jwt: token });
            database.close();
        });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

// Editar usuário
routes.delete('/:id', async (req, res) => {
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