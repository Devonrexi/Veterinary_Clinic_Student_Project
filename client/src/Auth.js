import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const Login = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/login", formData);
      
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role); 

      alert(t("login") + " OK!");
      navigate("/my-animals");
      
      window.location.reload(); 
    } catch (err) {
      setError(err.response?.data?.message || "Error");
    }
  };

  return (
    <section className="card-section">
      <h2>{t("login_title")}</h2>
      <p style={{ textAlign: "center", marginBottom: "20px" }}>
        {t("login_desc")}
      </p>

      {error && (
        <div className="error" style={{ textAlign: "center", marginBottom: "10px" }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "0 auto" }}>
        <input
          type="email"
          placeholder={t("email")}
          required
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder={t("password")}
          required
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        <button type="submit" className="primary">
          {t("btn_login")}
        </button>
      </form>
    </section>
  );
};

export const Register = () => {
  const { t } = useTranslation(); 
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    second_name: "",
    role: "client",
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3001/register", formData);
      alert(t("register") + " OK!");
      navigate("/login");
    } catch (err) {
      alert("Error: " + err.response?.data?.message);
    }
  };

  return (
    <section className="card-section">
      <h2>{t("register_title")}</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: "500px", margin: "0 auto" }}>
        <input
          type="text"
          placeholder={t("first_name")}
          required
          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
        />
        <input
          type="text"
          placeholder={t("last_name")}
          required
          onChange={(e) => setFormData({ ...formData, second_name: e.target.value })}
        />
        <input
          type="email"
          placeholder={t("email")}
          required
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder={t("password")}
          required
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />

        <label style={{ marginTop: "10px", display: "block" }}>{t("role_label")}</label>
        <select onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
          <option value="client">{t("role_client")}</option>
          <option value="vet">{t("role_vet")}</option>
        </select>

        <button type="submit" className="primary">
          {t("btn_register")}
        </button>
      </form>
    </section>
  );
};