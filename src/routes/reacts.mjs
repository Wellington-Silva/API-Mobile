import { Router } from 'express';
import { ObjectId } from 'mongodb';
import jwt from '../modules/jwt.mjs';
import database from '../modules/db.mjs';

const routes = Router();

// Dar like
routes.put('/like/:questionId', async (req, res) => {
    try {
        const { questionId } = req.params;
        const { react } = req.body;
        database
            .db('pergunta')
            .collection('questions')
            .updateOne({ _id: ObjectId(questionId) },
                (react == true) ? { $inc: { qtdLikes: +1 } } : { $inc: { qtdNoLikes: +1 } })
            .then((result) => {
                result.modifiedCount
                    ? res.status(200).json({ error: false, message: "Gostei" })
                    : res.status(200).json({ error: true, message: "Não foi possível reagir a essa pergunta" })
            });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

export default routes;