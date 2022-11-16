import { Router } from 'express';
import { ObjectId } from 'mongodb';
import database from '../modules/db.mjs';

const routes = Router();

routes.get('/responses/:questionId', async (req, res) => {
    const { questionId } = req.params;
    try {
        database
            .db('QuestionBoxDB')
            .collection('response')
            .find({ questionId: ObjectId(questionId) })
            .limit(10)
            .toArray((err, result) => {
                if (err || !result) return res.status(404).json({ error: true, message: "Não respostas para essa pergunta" });
                res.status(200).json(result);
            });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
})

// Responder uma pergunta
routes.post('/response/:id', async (req, res) => {
    const { id } = req.params; // Identificador da Pergunta
    try {
        database
            .db('QuestionBoxDB')
            .collection('response')
            .findOne({ _id: ObjectId(id) }, (err, result) => {
                if (err || !result) res.status(404).json({ error: true, message: "Pergunta não encontrada" });
                const data = {
                    questionId: ObjectId(id),
                    senderId: ObjectId(result.userId),
                    text: req.body.text.toString(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                database
                    .db('QuestionBoxDB')
                    .collection('questions')
                    .updateOne({ _id: ObjectId(id) }, { $set: { ...data } })
                    .then((resultResponse) => {
                        resultResponse.modifiedCount
                            ? res.status(200).json(resultResponse)
                            : res.status(200).json({ error: true, message: "Não foi possível responder a pergunta" })
                    });
            });

    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});