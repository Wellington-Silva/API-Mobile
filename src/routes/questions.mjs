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
            });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

//  Listar perguntas feitas por um usuário
routes.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        database
            .db('QuestionBoxDB')
            .collection('questions')
            .find({ userId: ObjectId(userId) })
            .toArray((err, result) => {
                if (err || !result) return res.status(404).json({ error: true, message: "Nenhuma pergunta foi encotrada" });
                res.status(200).json(result);
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
        });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

//  Listar todas as questões (SCROLL INFINITO - PAGINATION)
routes.get('/:pagination', async (req, res) => {
    //  CODE
    const { userId } = req.params;
    const { pagination } = req.params;
    const page = parseInt(pagination);
    try {
        database
            .db('QuestionBoxDB')
            .collection('questions')
            .find({ userId: ObjectId(userId) })
            .sort({ _id: 1 })
            .limit(10)
            .skip(page > 0 ? page * 10 : 0)
            .toArray((err, result) => {
                if (err || !result) return res.status(404).json({ error: true, message: "Nenhuma pergunta foi encotrada" });
                res.status(200).json(result);
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
            tag: tagId,
            responses: [],
            createdAt: new Date(),
            updateAt: new Date()
        };
        database.db("QuestionBoxDB").collection("questions").insertOne(content, (err, result) => {
            if (err) throw { error: true, message: "Não foi possível realizar a pergunta" };
            res.status(200).json(result);
        });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

//  Reagir a uma pergunta
// routes.put('/like/:questionId', async (req, res) => {
//     const authHeader = req.headers.authentication;
//     const { _id } = jwt.verify(authHeader);

//     const { questionId } = req.params;
//     const { react } = req.body;

//     const data = {
//         userId: ObjectId(_id),
//         react: react,
//         createdAt: new Date(),
//         updatedAt: new Date()
//     }

//     try {
//         database.db('QuestionBoxDB').collection('reacts').insertOne(data, (err, result) => {
//             if (err || !result) return res.status(401).json({ error: true, message: "Não é possível reagir" })
//             database.db('QuestionBoxDB').collection('questions').updateOne({ _id: ObjectId(questionId) },
//                 (react === true) ? { $inc: { qtdLikes: +1 } } : { $inc: { qtdNoLikes: +1 } })
//                 .then((result) => {
//                     result.modifiedCount
//                         ? res.status(200).json({ error: false, message: "Reação registrada" })
//                         : res.status(200).json({ error: true, message: "Não foi possível reagir a essa pergunta" })
//                 });
//         });
//     } catch (e) {
//         res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
//     }
// });

// Responder uma pergunta - Criar Resposta
routes.post('/answer/:idAnswer', async (req, res) => {
    const token = req.headers.authentication;
    const { _id } = jwt.verify(token);
    const { idAnswer } = req.params; // Identificador da Pergunta

    const data = {
        _id: new ObjectId(),
        userId: ObjectId(_id),
        text: req?.body?.text?.toString(),
        bestAnswer: false,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    try {
        database
            .db('QuestionBoxDB')
            .collection('questions')
            .updateOne({ _id: ObjectId(idAnswer) }, { $push: { responses: data } })
            .then((resultResponse) => {
                resultResponse.modifiedCount
                    ? res.status(200).json({ error: false, message: "Resposta adicionada a pergunta" })
                    : res.status(503).json({ error: true, message: "A pergunta para resposta não foi encontrada" })
            });
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: "Houve um erro interno " + (e?.message || "") });
    }
});

//  Editar uma resposta
routes.put('/answer/:questionId/:answerId', async (req, res) => {
    const token = req.headers.authentication;
    const { _id } = jwt.verify(token);
    const { questionId, answerId } = req.params; // Identificador da Pergunta
    const { text } = req?.body; // Texto para atualizar
    try {
        database
            .db('QuestionBoxDB')
            .collection('questions')
            .updateOne(
                { _id: ObjectId(questionId), responses: { $elemMatch: { userId: ObjectId(_id), _id: ObjectId(answerId) } } },
                { $set: { "responses.$.text": text.toString(), "responses.$.updatedAt": new Date() } }
            )
            .then((resultResponse) => {
                resultResponse.modifiedCount
                    ? res.status(200).json({ error: false, message: "A sua resposta foi editada" })
                    : res.status(503).json({ error: true, message: "A pergunta que você tentou responder não foi encontrada" })
            });
    } catch (e) {

    }
});

export default routes;