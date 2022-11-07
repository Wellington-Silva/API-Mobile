import Joi from 'Joi';
import { ObjectId } from 'mongodb';

export default {
    create: (req, res, next) => { // OK
        const mountBody = (value) => {
            try {
                return { ...value };
            } catch (error) { res.status(400).json({ error: true, message: "Parâmetro de categoria inválido" }) }
        };

        const { error, value } = Joi.object({
            name: Joi.string().min(3).required().label("Nome inválido"),
            media: {
                image: Joi.array().min(1).max(6).required().label("Mínimo 1 e máximo 6 imagens"),
                video: Joi.array().min(0).max(6).required().label("Mínimo 0 e máximo 6 videos")
            },
            subcategory: Joi.string().regex(/[0-9a-fA-F]{24}/).required().label("Parâmetro de subcategoria inválido")
        }).validate(req.body)
        if (error) return res.status(400).json({ error: true, message: error?.message });
        else req.body = mountBody(value);
        next();
    }
};
