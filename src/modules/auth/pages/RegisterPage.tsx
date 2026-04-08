import { useState } from "react";
import { useAuth } from "../hooks/userAuth";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const { handleRegister } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("FORM DATA:", form); // Debug log untuk melihat data form

    try {
        await handleRegister(form);
        alert("Register berhasil");
        
        // Setelah register berhasil, arahkan pengguna ke halaman login
        navigate("/login");
    } catch (err: any) {
        alert(err.message || "Register gagal");
    }
    };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Register HRIS</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="password_confirmation"
            type="password"
            placeholder="Confirm Password"
            onChange={handleChange}
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Register
          </button>

          <button
            type="button"
            style={styles.loginButton}
            onClick={() => navigate("/login")}
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;

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
    width: "320px",
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
    backgroundColor: "#16a34a",
    color: "#fff",
    cursor: "pointer",
  },
  loginButton: {
    marginTop: "10px",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #4f46e5",
    backgroundColor: "transparent",
    color: "#4f46e5",
    cursor: "pointer",
  },
};