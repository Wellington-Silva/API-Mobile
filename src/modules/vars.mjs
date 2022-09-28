import { config } from "dotenv";

const local = config();
const env = (!process.env) ? local.parsed : process.env;

export default {
    port: env.PORT || 3000,
    db_credentials: env.DB_CREDENCIALS,
    secretJwt: env.SECRETJWT,
    expiresIn: env.EXPIRATION
}
