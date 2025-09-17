from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from loginbox import validate_login
import math
import re

app = FastAPI()

# Configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    email: str
    password: str

class CalculationRequest(BaseModel):
    expression: str

# Novas funções trigonométricas com tolerância
def safe_sin(x):
    result = math.sin(x)
    return 0.0 if abs(result) < 1e-10 else result

def safe_cos(x):
    result = math.cos(x)
    return 0.0 if abs(result) < 1e-10 else result

def safe_tan(x):
    result = math.tan(x)
    return 0.0 if abs(result) < 1e-10 else result

def safe_eval(expression):
    """
    Avalia uma expressão matemática de forma segura e trata valores muito próximos de zero
    apenas para funções trigonométricas.
    """
    # Substituir símbolos e funções
    expression = expression.replace("π", str(math.pi))
    expression = expression.replace("e", str(math.e))
    expression = expression.replace("²", "**2")
    expression = expression.replace("^", "**")
    expression = expression.replace("√", "math.sqrt")
    
    # Substituir funções trigonométricas por nossas versões seguras
    expression = re.sub(r'sin\(', 'safe_sin(', expression)
    expression = re.sub(r'cos\(', 'safe_cos(', expression)
    expression = re.sub(r'tan\(', 'safe_tan(', expression)
    expression = re.sub(r'log\(', 'math.log10(', expression)
    expression = re.sub(r'ln\(', 'math.log(', expression)
    expression = re.sub(r'abs\(', 'math.fabs(', expression)
    expression = re.sub(r'exp\(', 'math.exp(', expression)
    
    # Dicionário de funções e constantes permitidas
    allowed = {
        "math": math,
        "safe_sin": safe_sin,
        "safe_cos": safe_cos,
        "safe_tan": safe_tan,
        "__builtins__": {}
    }
    
    # Avaliar a expressão
    result = eval(expression, allowed)
    
    return result

@app.post("/login")
def login(req: LoginRequest):
    return validate_login(req.email, req.password)

@app.post("/calculate")
def calculate(req: CalculationRequest):
    try:
        result = safe_eval(req.expression)
        return {"success": True, "result": result}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.options("/login")
async def options_login():
    return {"allow": "POST"}

@app.options("/calculate")
async def options_calculate():
    return {"allow": "POST"}
