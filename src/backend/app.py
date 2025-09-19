from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from loginbox import validate_login
import math
import re
import cmath

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
    """Avalia expressão matemática de forma segura"""
    # Verificar se a expressão contém números complexos
    # Usar uma regex mais precisa para evitar falsos positivos
    has_complex = re.search(r'(?<![a-zA-Z_])[ij](?![a-zA-Z_])', expression) or re.search(r'\d+\s*[+-]\s*\d*\s*[ij]', expression)

    # Substituições seguras
    expression = re.sub(r'\bpi\b', str(math.pi), expression, flags=re.IGNORECASE)
    expression = re.sub(r'\be\b', str(math.e), expression, flags=re.IGNORECASE)
    expression = expression.replace("²", "**2")
    expression = expression.replace("^", "**")
    expression = expression.replace("√", "math.sqrt")

    # Funções matemáticas
    expression = re.sub(r'sin\(', 'safe_sin(', expression)
    expression = re.sub(r'cos\(', 'safe_cos(', expression)
    expression = re.sub(r'tan\(', 'safe_tan(', expression)

    expression = re.sub(r'asin\(', 'math.asin(', expression)
    expression = re.sub(r'acos\(', 'math.acos(', expression)
    expression = re.sub(r'atan\(', 'math.atan(', expression)

    expression = re.sub(r'sinh\(', 'math.sinh(', expression)
    expression = re.sub(r'cosh\(', 'math.cosh(', expression)
    expression = re.sub(r'tanh\(', 'math.tanh(', expression)

    expression = re.sub(r'log\(', 'math.log10(', expression)
    expression = re.sub(r'ln\(', 'math.log(', expression)
    expression = re.sub(r'abs\(', 'math.fabs(', expression)
    expression = re.sub(r'exp\(', 'math.exp(', expression)
    
    allowed = {
        "math": math,
        "safe_sin": safe_sin,
        "safe_cos": safe_cos,
        "safe_tan": safe_tan,
        "pi": math.pi,
        "e": math.e,
        "__builtins__": {}
    }

    if has_complex:
        expression = re.sub(r'(?<!\w)(\d*)\s*([ij])(?!\w)', r'\1*1j', expression)
        expression = expression.replace('*1j*1j', '*1j')
        allowed["cmath"] = cmath
        allowed["abs"] = abs

    result = eval(expression, allowed)

    if has_complex and isinstance(result, complex):
        real, imag = result.real, result.imag
        if abs(real) < 1e-10: real = 0
        if abs(imag) < 1e-10: imag = 0
        if imag == 0:
            result = real
        elif real == 0:
            result = f"{imag}i"
        else:
            sign = "+" if imag >= 0 else ""
            result = f"{real}{sign}{imag}i"

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




