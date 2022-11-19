import { Router } from 'express';
import { ObjectId } from 'mongodb';
import jwt from '../modules/jwt.mjs';
import database from '../modules/db.mjs';

const routes = Router();

// Listar perguntas por tag
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

//  Listar perguntas feitas por um usuário
routes.get('/user/:userId', async (req, res) => {
    //  CODE
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

//  Listar todas as questões (SCROLL INFINITO - PAGINATION)
routes.get('/', async (req, res) => {
    //  CODE
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

//  Reagir a uma pergunta
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
    }

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

// Responder uma pergunta - Criar Resposta
routes.post('/answer/:questionId', async (req, res) => {
    try {
        const { id } = req.params; // Identificador da Pergunta
        const data = {
            idQuestion: ObjectId(id),
            text: req.body.text.toString(),
            createdAt: new Date(),
            updatedAt: new Date()
        }
        database.db("QuestionBoxDB").collection("questions").updateOne({ _id: ObjectId(id) }, { $set: { response: data } })
            .then((result) => {
                result.modifiedCount
                    ? res.status(200).json(result)
                    : res.status(503).json({ error: true, message: "Pergunta não encontrada" })
                database.close();
            });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

//  Editar uma resposta
routes.put('/answer/:questionId/:indexAnswer', async (req, res) => {
    //  CODE
});

export default routes;