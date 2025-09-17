def validate_login(email: str, password: str):
    if email == "teste@gmail.com" and password == "123":
        return {"success": True, "user": {"name": "Test User", "email": email}}
    return {"success": False, "error": "Incorrect email or password."}

