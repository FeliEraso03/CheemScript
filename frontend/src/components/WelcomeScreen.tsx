import React, { useState } from "react";
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
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="welcome-root">
      {/* Panel izquierdo — Banner y Descripcion */}
      <div className="welcome-left-panel" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`welcome-flip-card ${isFlipped ? 'flipped' : ''}`}>
          <div className="welcome-flip-card-front">
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
              <p className="welcome-tagline">Much code. Very compile. Wow. (Click para voltear)</p>
            </div>
          </div>
          <div className="welcome-flip-card-back">
            <h2>Sobre CheemScript y Autómatas</h2>
            <p>
              Los <strong>Autómatas Finitos Deterministas (AFD)</strong> son modelos matemáticos de computación con estados y transiciones bien definidos, que aceptan o rechazan cadenas de símbolos.
            </p>
            <p>
              En <strong>CheemScript</strong>, cada bloque que conectas es validado como una transición en un AFD subyacente, garantizando la corrección de tus algoritmos antes de convertirse en código C++.
            </p>
            <div style={{ textAlign: 'left', marginTop: '0.5rem', background: 'rgba(0,0,0,0.03)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.4rem', color: '#444' }}>Características Principales:</h3>
              <ul style={{ paddingLeft: '1.2rem', color: '#555', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <li><strong>Basado en Scratch:</strong> Un entorno visual familiar e intuitivo mediante arrastrar y soltar bloques.</li>
                <li><strong>Programación Visual:</strong> Olvídate de la sintaxis estricta y enfócate en la lógica.</li>
                <li><strong>Generador de Código:</strong> Traduce automáticamente tus diagramas a código C++ listo para usar.</li>
                <li><strong>Validación por AFD:</strong> Evita errores en tiempo real usando teoría de lenguajes formales.</li>
                <li><strong>Ejecución Integrada:</strong> Compila y ejecuta el código generado directamente en el navegador.</li>
              </ul>
            </div>
            <p className="welcome-tagline" style={{ marginTop: '0.8rem' }}>(Click para volver)</p>
          </div>
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
