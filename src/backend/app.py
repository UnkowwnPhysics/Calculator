from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from loginbox import validate_login
import math
import re
import cmath
import numpy as np
import json

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

class EigenRequest(BaseModel):
    matrix: str

# Funções trigonométricas seguras
def safe_sin(x): return math.sin(x) if abs(math.sin(x)) >= 1e-10 else 0.0
def safe_cos(x): return math.cos(x) if abs(math.cos(x)) >= 1e-10 else 0.0
def safe_tan(x): return math.tan(x) if abs(math.tan(x)) >= 1e-10 else 0.0

def preprocess_expression(expression: str) -> str:
    """Adiciona parênteses automaticamente se usuário digitar sin34 (sem parênteses)."""
    trig_functions = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh']
    for func in trig_functions:
        pattern = r'\b' + func + r'(?=\d)'
        expression = re.sub(pattern, func + '(', expression)
    return expression

def safe_eval(expression: str):
    """Avalia expressão matemática de forma segura"""
    expression = preprocess_expression(expression)

    has_complex = re.search(r'(?<![a-zA-Z_])[ij](?![a-zA-Z_])', expression) or \
                  re.search(r'\d+\s*[+-]\s*\d*\s*[ij]', expression)

    expression = re.sub(r'\bpi\b', str(math.pi), expression, flags=re.IGNORECASE)
    expression = re.sub(r'\be\b', str(math.e), expression, flags=re.IGNORECASE)
    expression = expression.replace("²", "**2").replace("^", "**").replace("√", "math.sqrt")

    # Mapeamento funções
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

def parse_matrix(matrix_str: str):
    """Converte string da matriz para numpy array"""
    try:
        # Remove espaços e converte para lista Python
        matrix_str = matrix_str.strip()
        matrix_list = json.loads(matrix_str)
        return np.array(matrix_list, dtype=complex)
    except Exception as e:
        raise ValueError(f"Formato de matriz inválido: {str(e)}")

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

@app.post("/eigen")
def calculate_eigen(req: EigenRequest):
    try:
        matrix = parse_matrix(req.matrix)
        
        # Calcula autovalores e autovetores
        eigenvalues, eigenvectors = np.linalg.eig(matrix)
        
        # Formata os resultados
        def format_complex(num):
            real = num.real
            imag = num.imag
            if abs(real) < 1e-10: real = 0
            if abs(imag) < 1e-10: imag = 0
            
            if imag == 0:
                return f"{real:.6g}"
            elif real == 0:
                return f"{imag:.6g}i"
            else:
                sign = "+" if imag >= 0 else ""
                return f"{real:.6g}{sign}{imag:.6g}i"

        formatted_eigenvalues = [format_complex(val) for val in eigenvalues]
        
        formatted_eigenvectors = []
        for i in range(eigenvectors.shape[1]):
            vector = [format_complex(val) for val in eigenvectors[:, i]]
            formatted_eigenvectors.append(vector)

        return {
            "success": True,
            "eigenvalues": formatted_eigenvalues,
            "eigenvectors": formatted_eigenvectors
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.options("/login")
async def options_login():
    return {"allow": "POST"}

@app.options("/calculate")
async def options_calculate():
    return {"allow": "POST"}

@app.options("/eigen")
async def options_eigen():
    return {"allow": "POST"}
