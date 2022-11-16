import { Router } from 'express';
import { ObjectId } from 'mongodb';
import database from '../modules/db.mjs';
import jwt from '../modules/jwt.mjs';

const routes = Router();

// Listar Respostas de uma pergunta
routes.get('/:questionId/:pagination', async (req, res) => {
    const { questionId, pagination } = req.params;
    const page = parseInt(pagination);
    try {
        database
            .db('QuestionBoxDB')
            .collection('response')
            .find({ questionId: ObjectId(questionId) })
            .limit(10)
            .sort({ _id: 1 })
            .limit(10)
            .skip(page > 0 ? page * 10 : 0)
            .toArray((err, result) => {
                if (err || !result) return res.status(404).json({ error: true, message: "Não respostas para essa pergunta" });
                res.status(200).json(result);
            });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

// Responder uma pergunta
routes.post('/:id', async (req, res) => {
    const authHeader = req.headers.authentication;
    const { _id } = jwt.verify(authHeader);
    const { id } = req.params; // Identificador da Pergunta
    try {
        database
            .db('QuestionBoxDB')
            .collection('questions')
            .findOne({ _id: ObjectId(id) }, (err, result) => {
                if (err || !result) res.status(404).json({ error: true, message: "Pergunta não encontrada" });
                const data = {
                    questionId: ObjectId(id), // ID da pergunta
                    senderId: ObjectId(result.userId), // ID de quem perguntou
                    userId: ObjectId(_id), // ID de quem respondeu
                    text: req.body.text.toString(),
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                database
                    .db('QuestionBoxDB')
                    .collection('response')
                    .insertOne(data, (error, resultResponse) => {
                        if (error || !resultResponse) return res.status(200).json({ error: true, message: "Não foi possível responder a pergunta" });
                        res.status(200).json(resultResponse);
                    });
            });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

export default routes;