import express from "express";
import vars from "./src/modules/vars.mjs";
import questions from "./src/routes/questions.mjs";

try {
    const app = express();
    const version = vars.version;
    app.use(express.json({ limit: '50mb' }));

    //  Rotas
    app.use(`/br/questions`, questions);

    app.listen(vars.port, () =>
        console.log("Server started", `Running server on ${vars.port}`)
    );
} catch (e) {
    console.log(e);
}