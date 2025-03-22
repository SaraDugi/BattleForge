import mysql.connector
from mysql.connector import pooling
from config import DB_CONFIG
from logger_config import logger

db_pool = pooling.MySQLConnectionPool(
    pool_name="mypool",
    pool_size=5,
    **DB_CONFIG
)

def test_connection():
    try:
        connection = db_pool.get_connection()
        if connection.is_connected():
            logger.info("Database connected successfully")
        connection.close()
    except mysql.connector.Error as err:
        logger.error(f"Database connection failed: {err}")