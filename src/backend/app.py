from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

# Modelo do request
class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
def login(req: LoginRequest):
    # Exemplo fixo (igual ao que você tinha no TSX)
    if req.email == "teste@gmail.com" and req.password == "123":
        return {"success": True, "user": {"name": "Test User", "email": req.email}}
    else:
        return {"success": False, "error": "Incorrect email or password."}
