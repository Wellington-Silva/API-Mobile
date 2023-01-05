import { Router } from 'express';
import { ObjectId } from 'mongodb';
import jwt from '../modules/jwt.mjs';
import database from '../modules/db.mjs';

const routes = Router();

// Listar todas as Tags (SCROLL INFINITO - PAGINATION)
routes.get('/:pagination', async (req, res) => {
    const { pagination } = req.params;
    const page = parseInt(pagination);
    try {
        database
            .db("QuestionBoxDB")
            .collection("tags")
            .find()
            .sort({ _id: 1 })
            .limit(5)
            .skip(page > 0 ? page * 5 : 0)
            .toArray((err, result) => {
                if (err || !result)
                    return res.status(404).json({ error: true, message: "Nenhuma tag foi encontrada" });
                res.status(200).json(result);
            });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

//  Listar as tags populares (As 8 primeiras tags)
routes.get('/firstsTags', async (req, res) => { // Ver como fazer essas mais populares
    try {
        database
            .db('QuestionBoxDB')
            .collection('tags')
            .find()
            .limit(8)
            .toArray((err, result) => {
                if (err || !result) return res.status(404).json({ error: true, message: "Nenhuma TAG encontrada" });
                res.status(200).json(result);
            });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

// Cadastrar uma TAG
routes.post('/', async (req, res) => {
    const authHeader = req.headers.authentication;
    const { _id } = jwt.verify(authHeader);
    const { title, description } = req.body;

    const data = {
        title: title,
        userId: ObjectId(_id),
        description: description,
        createdAt: new Date(),
        updatedAT: new Date(),
    };

    try {
        database.db('QuestionBoxDB').collection('tags').insertOne(data, (err, result) => {
            if (err || !result) return res.status(401).json({ error: true, message: "Não foi possível inserir essa TAG" });
            res.status(200).json(result);
        });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

export default routes;