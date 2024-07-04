import {Pool} from 'pg'

const pool = new Pool ({
    user: "postgres",
    password: "qwerty",
    host: "localhost",
    port: 5432,
    database: "habit_tracker_ai"
});



export default pool;