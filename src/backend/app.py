from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from loginbox import validate_login

app = FastAPI()

# Adicionar configuração CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, substitua pelo seu domínio
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
def login(req: LoginRequest):
    return validate_login(req.email, req.password)

# Adicionar handler para requisições OPTIONS
@app.options("/login")
async def options_login():
    return {"allow": "POST"}
