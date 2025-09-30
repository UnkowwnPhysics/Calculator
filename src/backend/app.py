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

# Função para arredondar valores muito pequenos para zero
def round_small_values(result, threshold=1e-10):
    """
    Arredonda valores muito pequenos para zero, especialmente para funções trigonométricas.
    """
    if isinstance(result, (int, float, complex)):
        # Para números reais
        if isinstance(result, (int, float)):
            if abs(result) < threshold:
                return 0
        # Para números complexos
        elif isinstance(result, complex):
            real = result.real
            imag = result.imag
            if abs(real) < threshold:
                real = 0
            if abs(imag) < threshold:
                imag = 0
            return complex(real, imag)
    return result

# Wrappers para funções trigonométricas com arredondamento
def safe_sin(x): return round_small_values(math.sin(x))
def safe_cos(x): return round_small_values(math.cos(x))
def safe_tan(x): return round_small_values(math.tan(x))
def safe_asin(x): return round_small_values(math.asin(x))
def safe_acos(x): return round_small_values(math.acos(x))
def safe_atan(x): return round_small_values(math.atan(x))
def safe_sinh(x): return round_small_values(math.sinh(x))
def safe_cosh(x): return round_small_values(math.cosh(x))
def safe_tanh(x): return round_small_values(math.tanh(x))
def safe_csin(x): return round_small_values(cmath.sin(x))
def safe_ccos(x): return round_small_values(cmath.cos(x))
def safe_ctan(x): return round_small_values(cmath.tan(x))

# Models
class LoginRequest(BaseModel):
    email: str
    password: str

class CalculationRequest(BaseModel):
    expression: str

class EigenRequest(BaseModel):
    matrix: str

class Graph2DRequest(BaseModel):
    expression: str
    x_min: float = -10
    x_max: float = 10
    points: int = 200

class Graph3DRequest(BaseModel):
    expression: str
    x_min: float = -5
    x_max: float = 5
    y_min: float = -5
    y_max: float = 5
    points: int = 50

# Funções matemáticas seguras
def safe_eval(expr: str):
    allowed_names = {
        # constantes
        "pi": math.pi,
        "π": math.pi,
        "e": math.e,
        "i": 1j,

        # funções reais com arredondamento
        "sin": safe_sin, "cos": safe_cos, "tan": safe_tan,
        "asin": safe_asin, "acos": safe_acos, "atan": safe_atan,
        "sinh": safe_sinh, "cosh": safe_cosh, "tanh": safe_tanh,
        "log": lambda x, base=10: round_small_values(math.log(x, base)),
        "ln": lambda x: round_small_values(math.log(x)),
        "sqrt": lambda x: round_small_values(math.sqrt(x)),
        "abs": abs,
        "exp": lambda x: round_small_values(math.exp(x)),

        # funções complexas com arredondamento
        "csin": safe_csin, "ccos": safe_ccos, "ctan": safe_ctan,
        "sqrtc": lambda x: round_small_values(cmath.sqrt(x)), 
        "expc": lambda x: round_small_values(cmath.exp(x)),
    }

    # Substituir símbolos especiais
    expr = expr.replace("^", "**")
    expr = expr.replace("√", "sqrt")

    # Avaliar com restrição
    result = eval(expr, {"__builtins__": None}, allowed_names)
    
    # Arredondamento final para garantir
    return round_small_values(result)

# Função para avaliar expressões com variáveis
def safe_eval_with_vars(expr: str, variables: dict):
    allowed_names = {
        # constantes
        "pi": math.pi,
        "π": math.pi,
        "e": math.e,
        "i": 1j,

        # funções reais com arredondamento
        "sin": safe_sin, "cos": safe_cos, "tan": safe_tan,
        "asin": safe_asin, "acos": safe_acos, "atan": safe_atan,
        "sinh": safe_sinh, "cosh": safe_cosh, "tanh": safe_tanh,
        "log": lambda x, base=10: round_small_values(math.log(x, base)),
        "ln": lambda x: round_small_values(math.log(x)),
        "sqrt": lambda x: round_small_values(math.sqrt(x)),
        "abs": abs,
        "exp": lambda x: round_small_values(math.exp(x)),

        # funções complexas com arredondamento
        "csin": safe_csin, "ccos": safe_ccos, "ctan": safe_ctan,
        "sqrtc": lambda x: round_small_values(cmath.sqrt(x)), 
        "expc": lambda x: round_small_values(cmath.exp(x)),
    }
    
    # Adicionar variáveis ao namespace permitido
    allowed_names.update(variables)

    # Substituir símbolos especiais
    expr = expr.replace("^", "**")
    expr = expr.replace("√", "sqrt")

    # Avaliar com restrição
    result = eval(expr, {"__builtins__": None}, allowed_names)
    
    # Arredondamento final para garantir
    return round_small_values(result)

# ---------------------------
# Endpoints
# ---------------------------

@app.post("/login")
def login(req: LoginRequest):
    # Aqui devolvemos um token e um objeto user
    return {
        "success": True,
        "message": "Login successful",
        "token": "dummy-token",   # Aqui no futuro podes gerar JWT
        "user": {
            "name": req.email.split("@")[0],  # só exemplo
            "email": req.email
        }
    }


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

@app.post("/graph2d")
def graph_2d(req: Graph2DRequest):
    try:
        logger.info(f"Expressão gráfico 2D recebida: {req.expression}")
        
        x_values = np.linspace(req.x_min, req.x_max, req.points)
        y_values = []
        valid_points = []
        
        for i, x in enumerate(x_values):
            try:
                # Avaliar a expressão para cada valor de x
                y = safe_eval_with_vars(req.expression, {'x': x})
                
                # Verificar se é um número válido
                if isinstance(y, (int, float)) and not (math.isnan(y) or math.isinf(y)):
                    y_values.append(float(y))
                    valid_points.append(i)
                else:
                    y_values.append(None)
            except Exception:
                y_values.append(None)
        
        # Filtrar apenas os pontos válidos
        filtered_x = [float(x_values[i]) for i in valid_points]
        filtered_y = [y_values[i] for i in valid_points]
        
        return {
            "success": True,
            "data": {
                "x": filtered_x,
                "y": filtered_y,
                "expression": req.expression
            }
        }
        
    except Exception as e:
        logger.error(f"Erro no gráfico 2D: {str(e)}")
        return {"success": False, "error": str(e)}

@app.post("/graph3d")
def graph_3d(req: Graph3DRequest):
    try:
        logger.info(f"Expressão gráfico 3D recebida: {req.expression}")
        
        x = np.linspace(req.x_min, req.x_max, req.points)
        y = np.linspace(req.y_min, req.y_max, req.points)
        X, Y = np.meshgrid(x, y)
        Z = []
        
        for i in range(len(x)):
            row = []
            for j in range(len(y)):
                try:
                    # Avaliar a expressão para cada par (x,y)
                    z_val = safe_eval_with_vars(req.expression, {'x': X[i][j], 'y': Y[i][j]})
                    
                    # Verificar se é um número válido
                    if isinstance(z_val, (int, float)) and not (math.isnan(z_val) or math.isinf(z_val)):
                        row.append(float(z_val))
                    else:
                        row.append(0.0)
                except Exception:
                    row.append(0.0)
            Z.append(row)
        
        return {
            "success": True,
            "data": {
                "x": X.tolist(),
                "y": Y.tolist(),
                "z": Z,
                "expression": req.expression
            }
        }
        
    except Exception as e:
        logger.error(f"Erro no gráfico 3D: {str(e)}")
        return {"success": False, "error": str(e)}

@app.get("/")
def read_root():
    return {"message": "API de Cálculo funcionando com Autovalores, Calculadora e Gráficos!"}
