CREATE DATABASE habit_tracker_AI;

CREATE TABLE user(
    user_id SERIAL PRIMARY KEY,
    email text UNIQUE NOT NULL,
    password text NOT NULL
)