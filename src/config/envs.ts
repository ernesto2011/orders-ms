import 'dotenv/config';
import * as joi from 'joi'

interface EnvVars {
    PORT:number;
    PRODUCTS_MICROSERVICE_HOST:string;
    PRODUCTS_MICROSERVICE_PORT:number;
}

const envVarsSchema = joi.object({
    PORT: joi.number().required(),
    PRODUCTS_MICROSERVICE_HOST: joi.string().required(),
    PRODUCTS_MICROSERVICE_PORT: joi.number().required(),
    
    //DATABASE_URL: joi.string().required(),
}).unknown(true)

const {error, value} = envVarsSchema.validate(process.env);

if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}
const envVars: EnvVars = value;

export const envs = {
    port: envVars.PORT,
    productsService: {
        host: envVars.PRODUCTS_MICROSERVICE_HOST,
        port: envVars.PRODUCTS_MICROSERVICE_PORT,
    },
}
