import React from "react";
import bannerImg from "../assets/banner.png";
import logoImg from "../assets/logo.png";

interface WelcomeScreenProps {
  onStart: () => void;
}

// Lista de integrantes — editar con los nombres reales
const MEMBERS = [
  "Andrés Manuel Ramos Pájaro",
  "Elias David Mieles Gomez",
  "Harry Perez Perea",
  "Juan Felipe Eraso Navarro",
  "Vlad Esteban Preciado Ruiz",
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="welcome-root">
      {/* Panel izquierdo — Banner y Descripcion */}
      <div className="welcome-left-panel">
        <div className="welcome-banner-wrapper">
          <img
            src={bannerImg}
            alt="CheemScript — Modelo AFD Estados y Transiciones"
            className="welcome-banner-img"
          />
        </div>
        <div className="welcome-description-box">
          <p className="welcome-desc-text">
            CheemScript es un entorno visual de programación que combina
            aprendizaje interactivo y fundamentos de lenguajes formales. A
            través de bloques intuitivos, los usuarios pueden construir
            algoritmos, recibir validación en tiempo real mediante autómatas
            finitos deterministas y comprender cómo sus soluciones se
            transforman automáticamente en código C++. Además, la plataforma
            permite compilar y ejecutar los programas generados, conectando la
            teoría de la computación con la práctica del desarrollo de software.
          </p>
          <p className="welcome-tagline">Much code. Very compile. Wow.</p>
        </div>
      </div>

      {/* Panel derecho — Informacion del proyecto */}
      <div className="welcome-info">
        {/* Orbe decorativo de fondo */}
        <div className="welcome-info-glow" aria-hidden="true" />

        <div className="welcome-info-inner">
          {/* Header con logo */}
          <div className="welcome-logo-row" style={{ animationDelay: '0.1s' }}>
            <div className="welcome-logo-ring">
              <img src={logoImg} alt="CheemScript logo" className="welcome-logo" />
            </div>
            <div className="welcome-title-group">
              <h1 className="welcome-title">CheemScript</h1>
              <p className="welcome-subtitle">
                Editor visual de programacion con automatas
              </p>
            </div>
          </div>

          <hr className="welcome-divider" />

          {/* Info cards */}
          <div className="welcome-info-cards" style={{ animationDelay: '0.2s' }}>
            <div className="welcome-info-card">
              <p className="welcome-label">Asignatura</p>
              <p className="welcome-value">
                Teoria de Automatas y lenguajes formales
              </p>
            </div>
            <div className="welcome-info-card">
              <p className="welcome-label">Docente</p>
              <p className="welcome-value welcome-value-accent">
                Luis Carlos Tovar Garrido
              </p>
            </div>
          </div>

          <hr className="welcome-divider" />

          {/* Integrantes */}
          <section className="welcome-section" style={{ animationDelay: '0.3s' }}>
            <p className="welcome-label">Integrantes del equipo</p>
            <ol className="welcome-members">
              {MEMBERS.map((name, index) => (
                <li
                  key={index}
                  className="welcome-member-item"
                  style={{ animationDelay: `${0.35 + index * 0.06}s` }}
                >
                  <span className="welcome-member-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="welcome-member-name">{name}</span>
                </li>
              ))}
            </ol>
          </section>

          <hr className="welcome-divider" />

          {/* Boton */}
          <div className="welcome-btn-wrapper" style={{ animationDelay: '0.65s' }}>
            <button
              id="btn-open-editor"
              className="welcome-btn"
              type="button"
              onClick={onStart}
            >
              <span>Abrir Editor</span>
              <svg
                width="18"
                height="18"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
