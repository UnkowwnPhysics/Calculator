from flask import Flask, request, jsonify
from flask_cors import CORS
from loginbox import login_bp

app = Flask(__name__)
CORS(app)  # Permite requisições do frontend

# Registra o blueprint de autenticação
app.register_blueprint(login_bp)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
