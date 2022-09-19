import { Router } from 'express';
// import { ObjectId } from 'mongodb';
import database from '../modules/db.mjs';

const routes = Router();

// Cadastrar uma TAG
routes.post('/tags', async (req, res) => {
    try {
        const data = {
            name: req.body.name,
            createdAt: new Date(),
            updatedAT: new Date()
        };
        database.db("QuestionsBoxDB").collection("tags").insertOne((err, result) => {
            if (err || !result) throw { error: true, message: "Não foi possível inserir essa TAG" };
            res.status(200).json(result);
            database.close();
        });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

export default routes;