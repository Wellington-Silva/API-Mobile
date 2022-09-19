import { Router } from 'express';
import { ObjectId } from 'mongodb';
import database from '../modules/db.mjs';

const routes = Router();

// Detalhes do usuário
routes.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        database.db('QuestionBoxServer').collection('users').find({ _id: ObjectId(id) }, (err, result) => {
            if (err || !result) throw { error: true, message: "Usuário não encontrado" };
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
                if (err || !result) throw { error: true, message: "Usuário não encontrado" };
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
        const content = {
            ...req.body,
            disabled: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        database.db("QuestionBoxDB").collection("users").insertOne(content, (err, result) => {
            if (err) throw { error: true, message: "Não foi possível realizar a pergunta" };
            res.status(200).json(result);
            database.close();
        });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

// Editar usuário
routes.delete('/:id', async (req, res) => {
    try {
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