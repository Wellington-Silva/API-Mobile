import { Router } from 'express';
import { ObjectId } from 'mongodb';
import jwt from '../modules/jwt.mjs';
import database from '../modules/db.mjs';

const routes = Router();

// Reagir
routes.put('/like/:questionId', async (req, res) => {
    const authHeader = req.headers.authentication;
    const { _id } = jwt.verify(authHeader);

    const { questionId } = req.params;
    const { react } = req.body;

    const data = {
        userId: ObjectId(_id),
        react: react,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    try {
        database.db('QuestionBoxDB').collection('reacts').insertOne(data, (err, result) => {
            if (err || !result) return res.status(401).json({ error: true, message: "Não é possível reagir" })
            database.db('QuestionBoxDB').collection('questions').updateOne({ _id: ObjectId(questionId) },
                (react === true) ? { $inc: { qtdLikes: +1 } } : { $inc: { qtdNoLikes: +1 } })
                .then((result) => {
                    result.modifiedCount
                        ? res.status(200).json({ error: false, message: "Reação registrada" })
                        : res.status(200).json({ error: true, message: "Não foi possível reagir a essa pergunta" })
                });
        });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

export default routes;