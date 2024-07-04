import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";

dotenv.config();

const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.5,
    maxTokens: 1000,
    verbose: true
});

export const getResponse = async () => {
    try 
    {
        const response = await model.invoke("Write a poem about AI");
        console.log(response);
    }
    catch(error)
    {
        console.log(error);
    }
}