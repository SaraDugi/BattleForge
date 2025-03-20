import mysql.connector
from mysql.connector import pooling
from config import DB_CONFIG

db_pool = pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=5,
    **DB_CONFIG
)

def test_connection():
    try:
        connection = db_pool.get_connection()
        if connection.is_connected():
            print("Database connected successfully")
        connection.close()
    except mysql.connector.Error as err:
        print("Database connection failed:", err)