import { Router } from 'express';
import { ObjectId } from 'mongodb';
import jwt from '../modules/jwt.mjs';
import database from '../modules/db.mjs';

const routes = Router();

// Listar todas as Tags (SCROLL INFINITO - PAGINATION)
routes.get('/', async (req, res) => {
    try {
        database.db("QuestionBoxDB").collection("tags").find().toArray((err, result) => {
            if (err || !result) throw { error: true, message: "Nenhuma tag foi encontrada" };
            res.status(200).json(result);
        });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

//  Listar as tags populares (As 8 primeiras tags mais usadas)
routes.get('/popular', async (req, res) => {

    // CODE

});

// Cadastrar uma TAG
routes.post('/', async (req, res) => {
    const token = req.headers.authentication;
    const { _id } = jwt.verify(token);
    const { name, description } = req.body;
    try {
        const data = {
            userId: ObjectId(_id),
            name: name.toString(),
            description: description.toString() || '',
            deleted: false,
            createdAt: new Date(),
            updatedAT: new Date()
        };

        database.db('QuestionBoxDB').collection('tags').insertOne(data, (err, result) => {
            if (err || !result) res.status(401).json({ error: true, message: "Não foi possível inserir essa TAG" });
            res.status(200).json(result);
        });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

export default routes;