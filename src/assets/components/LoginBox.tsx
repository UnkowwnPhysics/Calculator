const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  // Verifica se é um email válido
  if (!email.includes("@")) {
    setError("Please enter a valid email address.");
    return;
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      setError("");
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } else {
      setError(data.error || "Login failed.");
    }
  } catch (err) {
    setError("Server error. Please try again later.");
  }
};
