import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  Presentation,
  FileCheck2,
  AlertCircle,
} from "lucide-react";
import {
  checkHealth,
  downloadZip,
  generatePackage,
  getProfiles,
  LOCAL_FALLBACK_PROFILES,
  triggerBlobDownload,
} from "./services/api";
import { HealthResponse, PackageResponse, ProfileItem, ProjectRequest } from "./types";
import { LandingPresentation } from "./components/LandingPresentation";
import { ProfileSelector } from "./components/ProfileSelector";
import { WizardForm } from "./components/WizardForm";
import { ResultsDashboard } from "./components/ResultsDashboard";

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<"presentation" | "wizard" | "results">("presentation");
  const [health, setHealth] = useState<HealthResponse>({
    status: "checking",
    app: "Arranque Seguro",
    version: "1.0.0",
  });
  const [profiles, setProfiles] = useState<ProfileItem[]>(LOCAL_FALLBACK_PROFILES);
  const [activeProfileId, setActiveProfileId] = useState<string | null>("perfil-1-llantas");
  const [isOfficialProfile, setIsOfficialProfile] = useState<boolean>(true);
  const [currentRequest, setCurrentRequest] = useState<ProjectRequest>(LOCAL_FALLBACK_PROFILES[0].request);
  const [packageData, setPackageData] = useState<PackageResponse | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Carga inicial de salud y perfiles
  useEffect(() => {
    checkHealth().then(setHealth);
    getProfiles().then((data) => {
      setProfiles(data);
      if (data.length > 0) {
        setCurrentRequest(data[0].request);
        setActiveProfileId(data[0].id);
      }
    });
  }, []);

  const handleSelectProfile = (profile: ProfileItem) => {
    setActiveProfileId(profile.id);
    setCurrentRequest(profile.request);
    setIsOfficialProfile(true);
    setErrorMessage(null);
    setActiveView("wizard");
  };

  const handleFieldChange = () => {
    if (isOfficialProfile) {
      setIsOfficialProfile(false);
      setActiveProfileId(null);
    }
  };

  const handleGenerate = async (formData: ProjectRequest) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      setCurrentRequest(formData);
      const result = await generatePackage(formData);
      setPackageData(result);
      setActiveView("results");
    } catch (err: any) {
      setErrorMessage(err.message || "Error al procesar la solicitud en el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const { blob, filename } = await downloadZip(currentRequest);
      triggerBlobDownload(blob, filename);
    } catch (err: any) {
      alert(`Error en la descarga: ${err.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Navbar Superior */}
      <header className="navbar">
        <div className="nav-brand">
          <div className="brand-icon">
            <ShieldCheck size={22} />
          </div>
          <div className="brand-text">
            <h1>Arranque Seguro</h1>
          </div>
          <span className="brand-badge">Navitrans</span>
        </div>

        <nav className="nav-links">
          <button
            type="button"
            className={`nav-tab-btn ${activeView === "presentation" ? "active" : ""}`}
            onClick={() => setActiveView("presentation")}
          >
            <Presentation size={16} /> Presentación Comité
          </button>

          <button
            type="button"
            className={`nav-tab-btn ${activeView === "wizard" ? "active" : ""}`}
            onClick={() => setActiveView("wizard")}
          >
            <FileCheck2 size={16} /> Formulario Guiado
          </button>

          {packageData && (
            <button
              type="button"
              className={`nav-tab-btn ${activeView === "results" ? "active" : ""}`}
              onClick={() => setActiveView("results")}
            >
              <LayoutDashboard size={16} /> Resultados y Documentos
            </button>
          )}

          <div className="status-pill" title={health.status === "ok" ? "Backend conectado" : "Backend desconectado"}>
            <span className={`status-dot ${health.status === "ok" ? "online" : "offline"}`} />
            <span>{health.status === "ok" ? "API Conectada" : "Modo Local"}</span>
          </div>
        </nav>
      </header>

      {/* Mensaje de Error Global */}
      {errorMessage && (
        <div
          style={{
            background: "rgba(244, 63, 94, 0.15)",
            border: "1px solid rgba(244, 63, 94, 0.35)",
            padding: "0.85rem 1.25rem",
            borderRadius: "var(--radius-md)",
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            color: "#fecdd3",
            fontSize: "0.875rem",
          }}
        >
          <AlertCircle size={18} color="#f43f5e" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Contenido Principal según Vista */}
      <main>
        {activeView === "presentation" && (
          <LandingPresentation onStart={() => setActiveView("wizard")} />
        )}

        {activeView === "wizard" && (
          <>
            <ProfileSelector
              profiles={profiles}
              activeProfileId={activeProfileId}
              onSelect={handleSelectProfile}
            />
            <WizardForm
              initialData={currentRequest}
              isOfficialProfile={isOfficialProfile}
              activeProfileName={profiles.find((p) => p.id === activeProfileId)?.title || null}
              onSubmit={handleGenerate}
              isLoading={isLoading}
              onFieldChange={handleFieldChange}
            />
          </>
        )}

        {activeView === "results" && packageData && (
          <ResultsDashboard
            packageData={packageData}
            projectRequest={currentRequest}
            onBackToForm={() => setActiveView("wizard")}
            onDownloadZip={handleDownload}
            isDownloading={isDownloading}
          />
        )}
      </main>
    </div>
  );
};
