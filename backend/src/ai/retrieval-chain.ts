import { ChatOpenAI } from "@langchain/openai";
import {ChatPromptTemplate} from "@langchain/core/prompts";
import {Document} from "@langchain/core/documents";
import {createStuffDocumentsChain} from "langchain/chains/combine_documents";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter"
import { OpenAIEmbeddings } from "@langchain/openai";
import {PGVectorStore} from "@langchain/community/vectorstores/pgvector";

import dotenv from "dotenv";

dotenv.config();

const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0.5
});

const prompt = ChatPromptTemplate.fromTemplate("Answer user's question. Context: {context} Question: {input}");

// const chain = prompt.pipe(model);

export const getContextResposne = async() => {
    const chain = await createStuffDocumentsChain({
        llm: model,
        prompt,
    })

    const loader = new CheerioWebBaseLoader("https://python.langchain.com/v0.1/docs/expression_language/");
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 200,
        chunkOverlap: 20
    });

    const splitDocs = await splitter.splitDocuments(docs);
    console.log(splitDocs);

    const embeddings = new OpenAIEmbeddings();

    // const response = await chain.invoke({
    //     input: "What is the LCEL?",
    //     context: docs
    // })

    // console.log(response);
}