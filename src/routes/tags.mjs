import { Router } from 'express';
import { ObjectId } from 'mongodb';
import jwt from '../modules/jwt.mjs';
import database from '../modules/db.mjs';

const routes = Router();

// Listar Tags
routes.get('/list', async (req, res) => {
    try {
        database.db("QuestionBoxDB").collection("tags").find().toArray((err, result) => {
            if (err || !result) throw { error: true, message: "Nenhuma tag foi encontrada" };
            res.status(200).json(result);
            database.close();
        });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

// Cadastrar uma TAG
routes.post('/', async (req, res) => {
    try {
        const token = req.headers.authentication;
        const { _id } = jwt.verify(token);
        const { name, description } = req.body;

        const data = {
            name: name,
            description: description.toString() || '',
            createrId: ObjectId(_id),
            createdAt: new Date(),
            updatedAT: new Date()
        };

        database.db("QuestionBoxDB").collection("tags").insertOne(data, (err, result) => {
            if (err || !result) res.status(401).json({ error: true, message: "Não foi possível inserir essa TAG" });
            res.status(200).json(result);
            database.close();
        });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

export default routes;