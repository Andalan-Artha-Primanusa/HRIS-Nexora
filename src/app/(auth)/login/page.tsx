import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/userAuth";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await handleLogin({ email, password });
      alert("Login berhasil");
    } catch (err: any) {
      alert(err.message || "Login gagal");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>HRIS Login</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>
        <button
            type="button"
            style={styles.registerButton}
            onClick={() => navigate("/register")}
            >
            Create Account
            </button>
      </div>
    </div>
  );
};

export default LoginPage;

const styles: Record<string, React.CSSProperties> = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fb",
  },
  card: {
    padding: "30px",
    borderRadius: "10px",
    backgroundColor: "#fff",
    boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
    width: "300px",
  },
  title: {
    marginBottom: "20px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#4f46e5",
    color: "#fff",
    cursor: "pointer",
  },
    registerButton: {
    marginTop: "10px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #4f46e5",
    backgroundColor: "transparent",
    color: "#4f46e5",
    cursor: "pointer",
    },
};