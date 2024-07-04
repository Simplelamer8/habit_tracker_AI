import { ChatOpenAI } from "@langchain/openai";
import {ChatPromptTemplate} from "@langchain/core/prompts"
import {StringOutputParser, CommaSeparatedListOutputParser} from "@langchain/core/output_parsers";
import {StructuredOutputParser} from "langchain/output_parsers";
import dotenv from "dotenv";

dotenv.config();

const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.5,
});

export async function callStringOutputParser()
{

    //Creating prompt template
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", "Generate a joke based on a word provided by the user"],
        ["human", "{input}"]
    ]);

    //Create parser
    const parser = new StringOutputParser();

    //Create chain
    const chain = prompt.pipe(model).pipe(parser);

    const response = await chain.invoke({
        input: "dog"
    })
    console.log(response);
}

//Structured Output Parser
export async function callStructuredParser(){
    const prompt = ChatPromptTemplate.fromTemplate("Extract information from the following phrase. Formatting Instructions: {formatting_instructions} Phrase: {phrase}");

    const outputParser = StructuredOutputParser.fromNamesAndDescriptions({
        name: "The name of the person",
        age: "The age of the person",
    });

    const chain = prompt.pipe(model).pipe(outputParser);

    const response = await chain.invoke({
        phrase: "Maxim is 30 years old",
        formatting_instructions: outputParser.getFormatInstructions()
    })

    console.log(response);

}

export async function callListOutputParser(){
    const prompt = ChatPromptTemplate.fromTemplate("Provide 5 synonyms, separated by commas, for the following word {word}")

    const outputParser = new CommaSeparatedListOutputParser();

    const chain = prompt.pipe(model).pipe(outputParser);

    const response = await chain.invoke({word: "happy"});
    console.log(response);
}