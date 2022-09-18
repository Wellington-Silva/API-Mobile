import { Router } from 'express';
import { ObjectId } from 'mongodb';
import database from '../modules/db.mjs';

const routes = Router();

// Cadastrar usuário
routes.post('/', async (req, res) => {
    try {
        const content = {
            ...req.body,
            disabled: false,
            createdAt: new Date(),
            updatedAt: new Date()
        }

        database.db("QuestionBoxDB").collection("questions").insertOne(content, (err, result) => {
            if (err) throw { error: true, message: "Não foi possível realizar a pergunta" };
            res.status(200).json(result);
            database.close();
        });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

export default routes;