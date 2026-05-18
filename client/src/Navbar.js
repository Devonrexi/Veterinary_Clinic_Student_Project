import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  let userRole = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      userRole = decoded.role;
    } catch (e) {
      localStorage.removeItem("token");
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const changeLanguage = () => {
    const newLang = i18n.language === "pl" ? "en" : "pl";
    i18n.changeLanguage(newLang);
  };

  return (
    <nav>
      <div className="nav-container">
        <Link to="/">{t("home_link")}</Link>
        {token && (
          <>
            <Link to="/my-animals">{t("my_animals")}</Link>
            <Link to="/appointments">{t("menu_appointments")}</Link>
            {userRole === "vet" && (
              <Link to="/all-animals" style={{ color: "white" }}>
                {t("all_animals")}
              </Link>
            )}
          </>
        )}
      </div>
      <div
        className="nav-container"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.1)",
          marginTop: "5px",
          paddingTop: "5px",
        }}>
        <button
          onClick={changeLanguage}
          style={{ fontSize: "0.9em", marginRight: "15px" }}>
          {i18n.language === "pl" ? "EN" : "PL"}
        </button>

        {token ? (
          <button onClick={handleLogout} className="danger">
            {t("logout")}
          </button>
        ) : (
          <>
            <Link to="/login">{t("login")}</Link>
            <Link to="/register">{t("register")}</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
