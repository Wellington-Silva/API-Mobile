import { Router, text } from 'express';
import { ObjectId } from 'mongodb';
import database from '../modules/db.mjs';

const routes = Router();

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
        // .project({});
    } catch (e) {
        res.status(e?.status || 500).json({ error: true, message: e?.message || "Houve um erro interno no servidor" });
    }
});

// Criar uma pergunta
routes.post('/', async (req, res) => {
    try {

        const content = {
            sender: ObjectId(),
            response: {
                text: '',
                userId: ObjectId()
            }
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

// Responder uma pergunta
routes.post('/response/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const data = {
            id: req.body.id,
            text: req.body.text.toString(),
            createdAt: new Date(),
            updatedAt: new Date()
        }
        database.db("QuestionBoxServer").collection("questions").updateOne({ _id: ObjectId(id) }, { $set: { response: data } })
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

export default routes;