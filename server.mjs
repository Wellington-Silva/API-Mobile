import express from "express";
import vars from "./src/modules/vars.mjs";
import questions from "./src/routes/questions.mjs";
import users from "./src/routes/users.mjs";
import tags from "./src/routes/tags.mjs";
import response from "./src/routes/responses.mjs";

try {
    const app = express();
    const version = vars.version;
    app.use(express.json({ limit: '50mb' }));

    //  Rotas
    app.use(`/br/questions`, questions);
    app.use(`/br/response`, response);
    app.use(`/br/users`, users);
    app.use(`/br/tags`, tags);

    app.listen(vars.port, () =>
        console.log("Server started", `Running server on ${vars.port}`)
    );
} catch (e) {
    console.log(e);
}