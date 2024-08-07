from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import ChatOpenAI,OpenAIEmbeddings
from langchain_community.vectorstores import PGVector
from langchain.memory import ConversationBufferMemory
from pydantic import BaseModel
import psycopg2
from psycopg2 import sql
from psycopg2.extras import Json
import json
from PyPDF2 import PdfReader
import openai
import os
from openai import OpenAI
import ast

from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pgvector.sqlalchemy import Vector
import numpy as np

from langchain.text_splitter import RecursiveCharacterTextSplitter

from dotenv import load_dotenv


# CONNECTION_STRING = "postgresql+psycopg2://postgres:qwerty@localhost:5433/vector_db"
# COLLECTION_NAME = "textFile"

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI()

# loader = TextLoader("textFile.txt", encoding="utf-8")
# documents = loader.load()

# # print(documents)
# text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=80)
# texts = text_splitter.split_documents(documents)
# print(len(texts))

# embeddings = OpenAIEmbeddings()
# vector = embeddings.embed_query("Testing the embedding model")

# doc_vectors = embeddings.embed_documents([t.page_content for t in texts[:5]])
# print(len(doc_vectors))


# db = PGVector.from_documents(embedding=embeddings, documents=texts, collection_name=COLLECTION_NAME, connection_string=CONNECTION_STRING)
# print("After declaring db")
# query = "What did the president say about Russia"

# similar = db.similarity_search_with_score(query, k = 2)

# for doc in similar:
#     print(doc)



from fastapi import FastAPI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains import LLMChain
from langchain_community.chat_message_histories.upstash_redis import UpstashRedisChatMessageHistory
import random
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional


app = FastAPI()

app.add_middleware(
    CORSMiddleware, 
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# history = UpstashRedisChatMessageHistory(
#     url=os.getenv("UPSTASH_URL"),
#     token=os.getenv("UPSTASH_TOKEN"),
#     session_id="chat1",
# )

model = ChatOpenAI(
    model="gpt-3.5-turbo",
    temperature=0.7
)

# prompt = ChatPromptTemplate.from_messages([
#     ("system", "You are an expert when it comes to habits like James Clear."),
#     MessagesPlaceholder(variable_name="chat_history"),
#     ("human", "{input}")
# ])

# memory = ConversationBufferMemory(
#     memory_key="chat_history",
#     return_messages=True,
#     chat_memory=history
# )

# chain = prompt | model

# chain = LLMChain(
#     llm=model,
#     prompt=prompt,
#     memory=memory,
#     verbose=True
# )

msg1 = {
    "input": "Hello"
}
# response1 = chain.invoke(msg1)
# print(response1)


db_config = {
    'dbname': 'habit_tracker_ai',
    'user': 'postgres',
    'password': 'qwerty',
    'host': 'localhost',
    'port': '5432'
}

class Habit(BaseModel):
    title: str
    description: str
    goal: str
    time_frame: Optional[int]

class PlanRequest(BaseModel):
    habits: List[Habit]
    user_id: int
    today: str

class SendPromptRequest(BaseModel):
    prompt: str
    user_id: int

class CreateQuotesRequest(BaseModel):
    user_id: int
    habit_title: str
    habit_description: str

class ShareExperienceRequest(BaseModel):
    user_id: int

class SummariseRecordRequest(BaseModel):
    user_id: int

class SimilaritySearchRequest(BaseModel):
    user_input: str


@app.get('/')
async def root():
    return {"example": "This is an example", "data": 0}

@app.post('/get_plan')
async def getPlan(req: PlanRequest):
    #DB connection
    # print("First things first...")
    connection = psycopg2.connect(**db_config)
    cursor = connection.cursor()

    query = sql.SQL("SELECT * FROM history WHERE user_id = %s")
    # print("after select...")


    # print("Before extracting data")
    habits = req.habits
    today = req.today

    filtered_habits = []
    for habit in habits:
        filtered_habits.append(habit.title + ". I want to achieve the goal of " + habit.goal + " " + habit.description + " Within " + str(habit.time_frame) + " days" + " and today is " + today)
    
    user_id = req.user_id
    inputInfoPrompt = "I am going to give you json array of strings and the date of today. Each of the string is characterized by goal and the number of days to achieve the goal. For each of the string I am asking you to develop ROADMAP with DAILY tasks"
    exemplar = "For instance, input: [\"Backend Python dev. I want to achieve the goal of becoming the Python backend developer within the next 60 days and today is 2024-07-11\"]. You need to RESPOND ONLY WITH JSON like:\n[\n    {\n   \"plan\": [\n            {\"day\": \"2024-07-12\", \"task\": \"Learn basic Python syntax and data structures (variables, lists, dictionaries, loops)\"},\n            {\"day\": \"2024-07-13\", \"task\": \"Practice basic Python programs (e.g., simple calculator, string manipulations)\"},\n            // (Fill the array up until the indicated day)\n        ]\n    }\n    // (Fill the array up until the last habit)\n]\n"


    # print("After extracting data")
    cursor.execute(query, (user_id, ))
    # print("After query execution")

    row = cursor.fetchone()

    # cursor.close()
    # connection.close()

    
    history = UpstashRedisChatMessageHistory(
        url=os.getenv("UPSTASH_URL"),
        token=os.getenv("UPSTASH_TOKEN"),
        session_id="chat" + str(user_id)
    )

    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True,
        chat_memory=history
    )



    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert when it comes to habits like James Clear."),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
    ])


    chain = LLMChain(
        llm=model,
        prompt=prompt,
        memory=memory,
        verbose=True
    )

    msg = {
        "input": "Hello" + inputInfoPrompt + exemplar + str(habits)
    }
    response = chain.invoke(msg)

    # for prop in json.loads(response['text']):
    #     print(prop)

    # print(response['text'])

    for habit, roadmap in zip(habits, json.loads(response['text'])):
        habit_roadmap_query = sql.SQL("INSERT INTO habit_roadmap (roadmap, habit) VALUES (%s, %s)")
        cursor.execute(habit_roadmap_query, (roadmap, habit.title))

    update_query = sql.SQL("""INSERT INTO history (user_id, conversation)
        VALUES (%s, %s)
    """)
    cursor.execute(update_query, (user_id, str(response)))

    connection.commit()


    connection.close()
    cursor.close()

    return {"message": "Conversation updated successfully", "response": response}


@app.post('/similarity_search')
async def similarity_search(req: SimilaritySearchRequest):
    connection = psycopg2.connect(**db_config)
    cursor = connection.cursor()

    user_input = req.user_input

    print(user_input)
    text_chunks = get_text_chunks(user_input)
    print(text_chunks)
    embeddings = generate_embeddings(text_chunks)
    
    print(embeddings)
    similar_embeddings = find_similar_embeddings(embeddings[0])

    res = []
    for result in similar_embeddings:
        similar_embedding, distance = result
        res.append(similar_embedding.content)
        print(similar_embedding.content, distance)
    
    connection.commit()

    connection.close()
    cursor.close()

    return res


@app.post('/summarise_records')
async def summarise_records(req: SummariseRecordRequest):
    connection = psycopg2.connect(**db_config)
    cursor = connection.cursor()

    user_id = req.user_id

    query = sql.SQL("SELECT * FROM daily_records WHERE user_id = %s ORDER BY record_date DESC LIMIT 7")

    cursor.execute(query, (user_id, ))

    rows = cursor.fetchall()

    if len(rows) < 7:
        return {"message": "There are less than 7 daily records"}

    record_ids = []

    for row in rows:
        record_ids.append(row[0])

    oldest_record_id = rows[-1][0]
    accumulated_records = ""
    for index, row in enumerate(rows):
        accumulated_records += "day" + str(index) + ": "
        accumulated_records += row[2]

    query = sql.SQL("SELECT * FROM summarized_records WHERE user_id = %s ORDER BY week_number DESC LIMIT 1")

    cursor.execute(query, (user_id, ))

    rows = cursor.fetchone()
    
    week_number = None
    daily_record_ids = None
    
    if rows is None:
        week_number = 1
        daily_record_ids = []
    else:
        week_number = rows.week_number + 1
        daily_record_ids = rows.daily_record_ids
        

    if oldest_record_id in daily_record_ids: 
        return {"message": "Can't summarise records because there are no 7 new records accumulated"}
    else:
        history = UpstashRedisChatMessageHistory(
            url=os.getenv("UPSTASH_URL"),
            token=os.getenv("UPSTASH_TOKEN"),
            session_id="chat" + str(user_id) + "summarize"
        )

        memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
            chat_memory=history
        )


        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a great summarizer with the skill of highlighting the key points in the persons journey in developing a habit"),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
        ])

        chain = LLMChain(
            llm=model,
            prompt=prompt,
            memory=memory,
            verbose=True
        )

        # print("After chain declaration")

        msg = {
            "input": accumulated_records
        }


        response = chain.invoke(msg)
        print(response['text'])

        summarized_record = response['text']

        try:
            query = sql.SQL("INSERT INTO summarized_records (user_id, week_number, summarized_record, daily_record_ids) VALUES (%s, %s, %s, %s)")
            print("before insert execution " + str(user_id) + " " + str(week_number) + " " + str(summarized_record) + " " + str(record_ids))
            cursor.execute(query, (user_id, week_number, summarized_record, record_ids))
        except Exception as e:
            print(f"An error occured: {e}")

    print(rows)
    
    connection.commit()
    cursor.close()
    connection.close()



@app.post('/share_experience')
async def share_experience(req: ShareExperienceRequest):
    connection = psycopg2.connect(**db_config)
    cursor = connection.cursor()

    user_id = req.user_id

    query = sql.SQL("SELECT * FROM habit_ratings WHERE user_id = %s ORDER BY date DESC LIMIT 10")

    cursor.execute(query, (user_id, ))

    rows = cursor.fetchall()

    avg = 0
    for habit_rating in rows:
        avg += habit_rating[4]

    if (10 < len(rows)):
        avg /= 10
    else:
        avg /= len(rows)


    if (avg > 4.5):#What is next? We need to check the records done by the user and its dates, if the dates of the records are similar to 
        # Here, you need to fetch the user notes and create embedding in vectordb.
        query = sql.SQL("SELECT * FROM summarized_records WHERE user_id = %s ORDER BY week_number ASC")

        cursor.execute(query, (user_id, ))

        rows = cursor.fetchall()

        user_journey = ""
        for row in rows: 
            user_journey += row[2]

        # task: Ask GPT to summarize all of the user_journey withing 1000 characters with key details
        history = UpstashRedisChatMessageHistory(
            url=os.getenv("UPSTASH_URL"),
            token=os.getenv("UPSTASH_TOKEN"),
            session_id="chat" + str(user_id) + "summarize"
        )

        memory = ConversationBufferMemory(
            memory_key="chat_history",
            return_messages=True,
            chat_memory=history
        )


        prompt = ChatPromptTemplate.from_messages([
            ("system", "You are a great summarizer with the skill of highlighting the key points in the persons journey in developing a habit. Your task is to summarize the given text withing 1000 characters"),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
        ])

        chain = LLMChain(
            llm=model,
            prompt=prompt,
            memory=memory,
            verbose=True
        )

        # print("After chain declaration")

        msg = {
            "input": user_journey
        }


        response = chain.invoke(msg)
        print(response['text'])
        summarised_user_journey = response['text']


        # task: Create text embedding from the GPT response and store in vectorDB
        text_chunks = get_text_chunks(summarised_user_journey)
        embeddings = generate_embeddings(text_chunks)
        insert_embeddings(text_chunks, embeddings)
        return {"message": "The user journey is successfully stored in the vectorDB!"}

    else:
        return {"message": "The user is not successful in developing a habit yet."}

    connection.commit()
    cursor.close()
    connection.close()

    return rows

    


@app.post('/create_quotes')
async def createQuotes(req: CreateQuotesRequest):
    connection = psycopg2.connect(**db_config)
    cursor = connection.cursor()

    user_id = req.user_id
    habit_title = req.habit_title
    habit_description = req.habit_description

    print(habit_title + habit_description)

    history = UpstashRedisChatMessageHistory(
        url=os.getenv("UPSTASH_URL"),
        token=os.getenv("UPSTASH_TOKEN"),
        session_id="chat" + str(user_id) + "quotes"
    )

    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True,
        chat_memory=history
    )


    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a great motivator give motivational quotes related to the user habit (quotes should be from real people in history, otherwise generate yourself) based on the following habit that the user wants to develop: ."),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
    ])

    chain = LLMChain(
        llm=model,
        prompt=prompt,
        memory=memory,
        verbose=True
    )

    # print("After chain declaration")

    msg = {
        "input": "habit title: " + habit_title + ".\n Habit description: " + habit_description + """.\n (Important!) You need to respond ONLY with array of strings for python language, strings that contains motivational quotes (both author and the quotes itself should be within the same string). like in the following example: ["Keep pushing man - David Goggins", \"Who is gonna carry the boats, and the logs?\"]"""
    }

    response = chain.invoke(msg)
    print(response['text'])

    query = sql.SQL("INSERT INTO quotes (user_id, quotes) VALUES (%s, %s)")

    cursor.execute(query, (user_id, ast.literal_eval(response['text'])))

    connection.commit()


    connection.close()
    cursor.close()
    return response

@app.post('/send_prompt')
async def sendPrompt(req: SendPromptRequest):
    
    
    
    #The problem is that the 99% of the work is done by person not by AI.
    


    #DB connection
    connection = psycopg2.connect(**db_config)
    cursor = connection.cursor()

    # print("Before Select")
    query = sql.SQL("SELECT * FROM history WHERE user_id = %s")

    # print("Before extracting data")
    user_prompt = req.prompt
    user_id = req.user_id
    # print("After extracting data")

    cursor.execute(query, (user_id, ))

    # print("AFter query execution")

    row = cursor.fetchone()

    # print("History")

    history = UpstashRedisChatMessageHistory(
        url=os.getenv("UPSTASH_URL"),
        token=os.getenv("UPSTASH_TOKEN"),
        session_id="chat" + str(user_id)
    )

    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=True,
        chat_memory=history
    )
    # Hello, I am struggling to meditate everyday for 5 minutes. PLease help me
    # print("Before chain")


    # similar_embeddings = find_similar_embeddings(generate_embeddings(user_prompt)[0])
    # textContext = ""
    # for result in similar_embeddings:
    #     similar_embedding, distance = result
    #     textContext += similar_embedding.content
    #     print(similar_embedding.content, distance)

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are professional when it comes to developing habits like James Clear."),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{input}"),
    ])

    chain = LLMChain(
        llm=model,
        prompt=prompt,
        memory=memory,
        verbose=True
    )

    # print("After chain declaration")

    msg = {
        "input": user_prompt +  "You need to respond in HTML format like \"Following is the example of something<br> 1) some random text\""
    }

    # print("Chain invoke")


    # similar_embeddings = find_similar_embeddings(generate_embeddings(user_prompt)[0])
    # for result in similar_embeddings:
    #     similar_embedding, distance = result
    #     print(similar_embedding.content, distance)

    response = chain.invoke(msg)

    update_query = sql.SQL("""UPDATE history 
        SET conversation = %s
        WHERE user_id = %s
    """)
    cursor.execute(update_query, (str(response), user_id))

    connection.commit()


    connection.close()
    cursor.close()
    return response



def get_text_chunks(text):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = text_splitter.split_text(text)
    return chunks



def read_pdf(file_path):
    pdf_reader = PdfReader(file_path)
    text = ""

    for page in pdf_reader.pages:
        extracted_text = page.extract_text()
        if extracted_text:  # Check if text is extracted successfully
            text += extracted_text  # Append text of each page

    return text


def generate_embeddings(text_chunks):
    embeddings = []
    for chunk in text_chunks:
        response = client.embeddings.create(
            input=[chunk],
            model="text-embedding-ada-002"
        )
        embeddings.append(response.data[0].embedding)
        print("generating embeddings...")
    return embeddings


# Example usage
# pdf_text = read_pdf("./pdfFiles/AtomicHabits.pdf")


# text_chunks = get_text_chunks(pdf_text)
# print(text_chunks)

# embeddings = generate_embeddings(text_chunks)

Base = declarative_base()
N_DIM = 1536

class TextEmbedding(Base):
    __tablename__ = 'text_embeddings'
    id = Column(Integer, primary_key=True, autoincrement=True)
    content = Column(String)
    embedding = Column(Vector(N_DIM))

# Connect to PostgreSQL
engine = create_engine('postgresql://postgres:qwerty@localhost:5432/vector_db')
Base.metadata.create_all(engine)

# Create a session
Session = sessionmaker(bind=engine)
session = Session()


def insert_embeddings(text_chunks, embeddings):
    for i in range(len(embeddings)):
        new_embedding = TextEmbedding(content=text_chunks[i], embedding=embeddings[i])
        session.add(new_embedding)
        print("inserting...")
    session.commit()
    session.close()
    print("Finished inserting embeddings!!!!!!!!!!!!!!!!!!!!")

# insert_embeddings(embeddings)

def find_similar_embeddings(query_embedding, limit=5):
    k = 5
    similarity_threshold = 0.3
    query = (
        session.query(TextEmbedding, TextEmbedding.embedding.cosine_distance(query_embedding).label("distance"))
        .filter(TextEmbedding.embedding.cosine_distance(query_embedding) < similarity_threshold)
        .order_by("distance")
        .limit(k)
        .all()
    )
    return query


# similar_embeddings = find_similar_embeddings(generate_embeddings("HOW TO TURN INSTANT GRATIFICATION INTO YOUR ADVANTAGE")[0])
# for result in similar_embeddings:
#     similar_embedding, distance = result
#     print(similar_embedding.content, distance)