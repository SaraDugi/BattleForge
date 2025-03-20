from flask import Flask
from flasgger import Swagger
from flask_jwt_extended import JWTManager
from routes import bp as booking_bp
from config import JWT_SECRET_KEY, JWT_ACCESS_TOKEN_EXPIRES
from db import test_connection

app = Flask(__name__)
app.register_blueprint(booking_bp)

swagger_template = {
    "swagger": "2.0",
    "info": {
        "title": "BookingService API",
        "description": "API for table reservations, tournament management, and notifications.",
        "version": "1.0.0"
    },
    "basePath": "/",
    "schemes": ["http"],
    "securityDefinitions": {
        "BearerAuth": {
            "type": "apiKey",
            "name": "Authorization",
            "in": "header",
            "description": "JWT Authorization header using the Bearer scheme. Example: 'Authorization: Bearer {token}'"
        }
    }
}

swagger = Swagger(app, template=swagger_template)

app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = JWT_ACCESS_TOKEN_EXPIRES

jwt = JWTManager(app)

if __name__ == '__main__':
    test_connection()
    port = 5050
    print(f"Starting BookingService on http://localhost:{port}")
    print(f"Swagger docs available at http://localhost:{port}/apidocs")
    app.run(debug=True, port=port)