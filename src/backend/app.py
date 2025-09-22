from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import math
import re
import cmath
import numpy as np
import json
import logging

# Configurar logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS liberado (funciona tanto local quanto em produção)
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

def safe_sin(x): return math.sin(x) if abs(math.sin(x)) >= 1e-10 else 0.0
def safe_cos(x): return math.cos(x) if abs(math.cos(x)) >= 1e-10 else 0.0
def safe_tan(x): return math.tan(x) if abs(math.tan(x)) >= 1e-10 else 0.0

@app.post("/login")
def login(req: LoginRequest):
    return {"success": True, "message": "Login successful"}

@app.post("/calculate")
def calculate(req: CalculationRequest):
    try:
        return {"success": True, "result": "42"}
    except Exception as e:
        return {"success": False, "error": str(e)}

def parse_matrix(matrix_str: str):
    try:
        logger.info(f"Tentando parsear matriz: {matrix_str}")
        matrix_str = matrix_str.strip()
        
        if not matrix_str.startswith('[') or not matrix_str.endswith(']'):
            raise ValueError("Matriz deve estar no formato [[a,b],[c,d]]")
            
        matrix_list = json.loads(matrix_str)
        logger.info(f"Matriz parseada como lista: {matrix_list}")
        
        matrix_array = np.array(matrix_list, dtype=complex)
        logger.info(f"Matriz convertida para array: {matrix_array}")
        
        return matrix_array
    except json.JSONDecodeError as e:
        raise ValueError(f"Formato JSON inválido: {str(e)}")
    except Exception as e:
        raise ValueError(f"Erro ao processar matriz: {str(e)}")

@app.post("/eigen")
async def calculate_eigen(request: Request):
    try:
        body = await request.body()
        logger.info(f"Corpo recebido: {body.decode()}")

        if not body:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": "Corpo da requisição vazio"}
            )

        try:
            req_data = await request.json()
            matrix_str = req_data.get("matrix", "")
        except Exception as e:
            return JSONResponse(
                status_code=400,
                content={"success": False, "error": f"JSON inválido: {str(e)}"}
            )
        
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
    return {"message": "API de Cálculo de Autovalores funcionando!"}
