import os
from dotenv import load_dotenv
from datetime import timedelta

load_dotenv()

CA_CERT_PATH = "BookingService\src\ca.pem"

DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME"),
    "ssl_ca": CA_CERT_PATH,
    "ssl_verify_cert": True
}

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")
JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
