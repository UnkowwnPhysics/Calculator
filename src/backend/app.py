from fastapi import FastAPI
from pydantic import BaseModel
from loginbox import validate_login

app = FastAPI()

class LoginRequest(BaseModel):
    email: str
    password: str

@app.post("/login")
def login(req: LoginRequest):
    return validate_login(req.email, req.password)
