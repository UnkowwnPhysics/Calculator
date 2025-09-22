from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import math
import cmath
import numpy as np
import json
import logging

# Configuração de logs
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

# Habilitar CORS (funciona local e em produção)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class LoginRequest(BaseModel):
    email: str
    password: str

class CalculationRequest(BaseModel):
    expression: str

class EigenRequest(BaseModel):
    matrix: str


# Funções matemáticas seguras
def safe_eval(expr: str):
    allowed_names = {
        # constantes
        "pi": math.pi,
        "π": math.pi,
        "e": math.e,
        "i": 1j,

        # funções reais
        "sin": math.sin, "cos": math.cos, "tan": math.tan,
        "asin": math.asin, "acos": math.acos, "atan": math.atan,
        "sinh": math.sinh, "cosh": math.cosh, "tanh": math.tanh,
        "log": lambda x, base=10: math.log(x, base),
        "ln": math.log,
        "sqrt": math.sqrt,
        "abs": abs,
        "exp": math.exp,

        # funções complexas
        "csin": cmath.sin, "ccos": cmath.cos, "ctan": cmath.tan,
        "sqrtc": cmath.sqrt, "expc": cmath.exp,
    }

    # Substituir símbolos especiais
    expr = expr.replace("^", "**")
    expr = expr.replace("√", "sqrt")

    # Avaliar com restrição
    return eval(expr, {"__builtins__": None}, allowed_names)


# Endpoints
@app.post("/login")
def login(req: LoginRequest):
    return {"success": True, "message": "Login successful"}


@app.post("/calculate")
def calculate(req: CalculationRequest):
    try:
        logger.info(f"Expressão recebida: {req.expression}")
        result = safe_eval(req.expression)
        return {"success": True, "result": result}
    except Exception as e:
        return {"success": False, "error": str(e)}


def parse_matrix(matrix_str: str):
    try:
        logger.info(f"Tentando parsear matriz: {matrix_str}")
        matrix_list = json.loads(matrix_str)
        matrix_array = np.array(matrix_list, dtype=complex)
        return matrix_array
    except Exception as e:
        raise ValueError(f"Erro ao processar matriz: {str(e)}")


@app.post("/eigen")
async def calculate_eigen(request: Request):
    try:
        req_data = await request.json()
        matrix_str = req_data.get("matrix", "")

        if not matrix_str:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "Campo 'matrix' é obrigatório"}
            )

        matrix = parse_matrix(matrix_str)

        if matrix.shape[0] != matrix.shape[1]:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "A matriz deve ser quadrada"}
            )

        eigenvalues, eigenvectors = np.linalg.eig(matrix)

        def format_complex(num):
            real, imag = num.real, num.imag
            if abs(real) < 1e-10: real = 0
            if abs(imag) < 1e-10: imag = 0
            if imag == 0: return f"{real:.6g}"
            elif real == 0: return f"{imag:.6g}i"
            else: return f"{real:.6g}{'+' if imag >= 0 else ''}{imag:.6g}i"

        formatted_eigenvalues = [format_complex(val) for val in eigenvalues]
        formatted_eigenvectors = [
            [format_complex(val) for val in eigenvectors[:, i]]
            for i in range(eigenvectors.shape[1])
        ]

        return JSONResponse({
            "success": True,
            "eigenvalues": formatted_eigenvalues,
            "eigenvectors": formatted_eigenvectors
        })

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )


@app.get("/")
def read_root():
    return {"message": "API de Cálculo funcionando com Autovalores e Calculadora!"}
