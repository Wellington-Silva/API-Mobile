import { Router } from 'express';
import { ObjectId } from 'mongodb';
import database from '../modules/db.mjs';

const routes = Router();

// Responder uma pergunta
routes.post('/response/:id', async (req, res) => {
    try {
        const { id } = req.params; // Identificador da Pergunta
        const data = {
            idQuestion: ObjectId(id),
            // idSender: ObjectId(idSender),
            text: req.body.text.toString(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        database.db('QuestionBoxDB').collection('questions').findOne({ _id: ObjectId(id) }, async (err, result) => {
            if (err || !result) res.status(404).json({ error: true, message: "Pergunta não encontrada" });
            database.db('QuestionBoxDB').collection('questions').updateOne({}, { $set: { ...data } }).then((resultResponse) => {
                resultResponse.modifiedCount
                    ? res.status(200).json(resultResponse)
                    : res.status(200).json({ error: true, message: "Não foi possível responder a pergunta" })
            });
        });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});