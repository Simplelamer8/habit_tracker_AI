import telebot
import webbrowser
from telebot import types
import psycopg2
from psycopg2 import sql
import schedule
import re
from functools import partial
import time
import random

# DB configuration...
db_config = {
    'dbname': 'habit_tracker_ai',
    'user': 'postgres',
    'password': 'qwerty',
    'host': 'localhost',
    'port': '5432'
}

# User data
user_data = {}



def motivational_message(chat_id, user_email):
    try:
        connection = psycopg2.connect(**db_config)
        cursor = connection.cursor()
        query = sql.SQL("SELECT * FROM users WHERE email = %s")
        cursor.execute(query, (user_email,))
        row = cursor.fetchone()
        if row:
            user_id = row[0]
            query = sql.SQL("SELECT * FROM quotes WHERE user_id = %s")
            cursor.execute(query, (user_id,))
            row = cursor.fetchone()
            if row:
                quotes = row[1]
                random_quote = random.choice(quotes)
                bot.send_message(chat_id, random_quote)
        cursor.close()
        connection.close()
    except Exception as e:
        print(f"Error in send_reminder_to_user: {e}")



def send_reminder_to_user(chat_id, user_email, time):
    try:
        connection = psycopg2.connect(**db_config)
        cursor = connection.cursor()
        query = sql.SQL("SELECT * FROM users WHERE email = %s")
        cursor.execute(query, (user_email,))
        row = cursor.fetchone()
        if row:
            user_id = row[0]
            query = sql.SQL("SELECT * FROM habits WHERE user_id = %s")
            cursor.execute(query, (user_id,))
            row = cursor.fetchone()
            if row:
                habit_name = row[2]
                bot.send_message(chat_id, f"Do not forget to do \"{habit_name}\". Remember, consistency is the key")
        cursor.close()
        connection.close()
    except Exception as e:
        print(f"Error in send_reminder_to_user: {e}")

def is_valid_email(email: str) -> bool:
    email_regex = re.compile(r"(^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)")
    return re.fullmatch(email_regex, email) is not None

def is_valid_time(time: str) -> bool:
    time_regex = re.compile(r"^(?:[01]\d|2[0-3]):[0-5]\d$")
    return re.fullmatch(time_regex, time) is not None

bot = telebot.TeleBot('7394620212:AAGfBazfUjv_gDXnb3x00dUvTAMzsaSRQrQ')

@bot.message_handler(commands=['start'])
def main(message):
    markup = types.ReplyKeyboardMarkup()
    btn1 = types.KeyboardButton("/website")
    markup.row(btn1)
    btn2 = types.KeyboardButton("/notifications")
    btn3 = types.KeyboardButton("/current_user_email")
    markup.row(btn2, btn3)
    bot.send_message(message.chat.id, 
        "Hello " + message.from_user.first_name + ".👋\n"
        + "This bot helps you to stick to your daily habits you want to develop!\n"
        + "A bit more about available commands: \n"
        + "/website - use this command to launch the web-application 🌐\n"
        + "/notifications - use this command to get information about current user ℹ️\n"
        + "/change_reminder_time - use this command to change the time when the reminder of your habit will be sent ⏰\n"
        + "/change_quote_time - use this command to change the time when the motivational quote of the day will be sent ⏰\n"
        + "/current_user_email - use this command to change registered email 📌",
        reply_markup=markup)

@bot.message_handler(commands=['site', 'website'])
def site(message):
    webbrowser.open("http://localhost:3000/")

@bot.message_handler(commands=['notifications'])
def notifications(message):
    try:
        connection = psycopg2.connect(**db_config)
        cursor = connection.cursor()
        query = sql.SQL("SELECT * FROM user_chats WHERE chat_id = %s")
        chat_id = message.chat.id
        cursor.execute(query, (chat_id,))
        row = cursor.fetchone()
        cursor.close()
        connection.close()
        if row is not None:
            bot.send_message(message.chat.id, f"Your current email is: {row[2]}; and the scheduled time is {row[3]}. \n To change the scheduled time of reminder, use command /change_reminder_time")
        else:
            bot.send_message(message.chat.id, "You don't have user email registered in the database, please use command /current_user_email to register new user")
    except Exception as e:
        print(f"Error in notifications handler: {e}")

@bot.message_handler(commands=['current_user_email'])
def email(message):
    chat_id = message.chat.id
    user_data[chat_id] = {'state': 'awaiting_email'}
    bot.send_message(chat_id, "Enter the email that you want to register: ")

@bot.message_handler(commands=['change_reminder_time'])
def change_reminder_time(message):
    user_data[message.chat.id] = {'state': 'awaiting_reminder_time'}
    bot.send_message(message.chat.id, "Enter the time for notification: ")

@bot.message_handler(commands=['change_quote_time'])
def change_quote_time(message):
    user_data[message.chat.id] = {'state': 'awaiting_quote_time'}
    bot.send_message(message.chat.id, "Enter the time for quote: ")

@bot.message_handler(func=lambda message: True)
def handle_message(message):
    chat_id = message.chat.id
    if chat_id in user_data:
        if user_data[chat_id]['state'] == 'awaiting_email':
            if is_valid_email(message.text):
                try:
                    connection = psycopg2.connect(**db_config)
                    cursor = connection.cursor()
                    query = sql.SQL("SELECT * FROM users WHERE email=%s")
                    cursor.execute(query, (message.text,))
                    row = cursor.fetchone()
                    if row:
                        query = sql.SQL("INSERT INTO user_chats (chat_id, user_email, scheduled_time) VALUES (%s, %s, %s)")
                        cursor.execute(query, (chat_id, message.text, "14:00"))
                        connection.commit()
                        cursor.close()
                        connection.close()
                        user_data[chat_id]['state'] = "Done"
                        bot.send_message(message.chat.id, "User email updated successfully, please use command /change_reminder_time, by default it is set to 14:00....")
                    else:
                        bot.send_message(message.chat.id, f"User with email: {message.text} is not found in the database...")
                except Exception as e:
                    print(f"Error in handle_message (awaiting_email): {e}")
            else:
                bot.send_message(message.chat.id, "Invalid email format")

        elif user_data[chat_id]['state'] == 'awaiting_reminder_time':
            if is_valid_time(message.text):
                try:
                    connection = psycopg2.connect(**db_config)
                    cursor = connection.cursor()
                    query = sql.SQL("SELECT * FROM user_chats WHERE chat_id = %s")
                    cursor.execute(query, (chat_id,))
                    row = cursor.fetchone()
                    user_email = row[2]
                    query = sql.SQL("UPDATE user_chats SET scheduled_reminder_time=%s WHERE user_email=%s")
                    cursor.execute(query, (message.text, user_email))
                    connection.commit()
                    cursor.close()
                    connection.close()
                    # Schedule time when bot will send notifications:
                    schedule.every().day.at(message.text).do(partial(send_reminder_to_user, chat_id, user_email, message.text))

                    user_data[chat_id]['state'] = 'Done'
                    bot.send_message(message.chat.id, f"Notification time updated to: {message.text}")
                except Exception as e:
                    print(f"Error in handle_message (awaiting_reminder_time): {e}")
            else:
                bot.send_message(message.chat.id, "Invalid time format")
        elif user_data[chat_id]['state'] == "awaiting_quote_time":
            if is_valid_time(message.text):
                try:
                    connection = psycopg2.connect(**db_config)
                    cursor = connection.cursor()
                    query = sql.SQL("SELECT * FROM user_chats WHERE chat_id = %s")
                    cursor.execute(query, (chat_id,))
                    row = cursor.fetchone()
                    user_email = row[2]
                    query = sql.SQL("UPDATE user_chats SET scheduled_quote_time=%s WHERE user_email=%s")
                    cursor.execute(query, (message.text, user_email))
                    connection.commit()
                    cursor.close()
                    connection.close()

                    # Schedule motivational messages...:
                    schedule.every().day.at(message.text).do(partial(motivational_message, chat_id, user_email))
                    user_data[chat_id]['state'] = 'Done'
                    bot.send_message(message.chat.id, f"Quote time updated to: {message.text}")
                except Exception as e:
                    bot.send_message(message.chat.id, f"You have no user registered in the database, please register user first...")
                    print(f"Error in handle_message (awaiting_reminder_time): {e}")
    else:
        bot.send_message(chat_id, "Please use the /current_user_email command to register your email or /change_reminder_time to change the time of notifications.")

def run_scheduled_tasks():
    while True:
        schedule.run_pending()
        time.sleep(1)

# schedule.every().day.at("09:12").do(partial(send_reminder_to_user, 965834035, "asdf@gmail.com", "09:12"))

# Run bot polling and scheduling tasks
import threading
threading.Thread(target=run_scheduled_tasks, daemon=True).start()
bot.polling(none_stop=True)
