import { Router } from 'express';
import { ObjectId } from 'mongodb';
import database from '../modules/db.mjs';
import jwt from '../modules/jwt.mjs';

const routes = Router();

// Listar perguntas pelas tag
routes.get('/questionbytag/:tagId', async (req, res) => {
    try {
        const { tagId } = req.params;
        console.log(tagId);
        database.db('QuestionBoxDB').collection('questions').find({ tags: ObjectId(tagId) })
            .toArray((err, result) => {
                if (err || !result) throw { error: true, message: "Nenhuma existe perguntas para essa TAG" };
                res.status(200).json(result);
                database.close();
            });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

// Buscar uma pergunta específica
routes.get('/:id', async (req, res) => {
    try {
        const { id } = req.params
        database.db("QuestionBoxDB").collection("questions").findOne({ _id: ObjectId(id) }, (err, result) => {
            console.log(result)
            if (err) throw { status: 503, message: "Erro ao buscar questão(s)" };
            res.status(200).json(result);
            database.close();
        });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

// Criar uma pergunta
routes.post('/', async (req, res) => {
    const authHeader = req.headers.authentication;
    const { _id } = jwt.verify(authHeader);
    const { tagId, question } = req.body;
    try {
        const content = {
            userId: ObjectId(_id),
            question: question.toString(),
            qtdLikes: 0,
            qtdNoLike: 0,
            tag: tagId,
            createdAt: new Date(),
            updateAt: new Date()
        };
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