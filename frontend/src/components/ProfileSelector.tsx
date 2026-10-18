import React from "react";
import { Sparkles, Layers, ShieldAlert, Cpu } from "lucide-react";
import { ProfileItem } from "../types";

interface ProfileSelectorProps {
  profiles: ProfileItem[];
  activeProfileId: string | null;
  onSelect: (profile: ProfileItem) => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({
  profiles,
  activeProfileId,
  onSelect,
}) => {
  const getBadgeClass = (id: string) => {
    if (id.includes("1")) return "profile-badge p1";
    if (id.includes("2")) return "profile-badge p2";
    return "profile-badge p3";
  };

  const getProfileIcon = (id: string) => {
    if (id.includes("1")) return <Layers size={14} color="#34d399" />;
    if (id.includes("2")) return <ShieldAlert size={14} color="#fbbf24" />;
    return <Cpu size={14} color="#fb7185" />;
  };

  return (
    <div className="profiles-banner">
      <div className="profiles-header">
        <div className="profiles-title">
          <Sparkles size={16} color="var(--accent-cyan)" />
          <span>Perfiles Oficiales de Prueba (Carga en 1 Clic)</span>
        </div>
        <div className="profiles-subtitle">
          Casos oficiales de <code>docs/datos-de-prueba.md</code> para probar el motor al instante
        </div>
      </div>

      <div className="profiles-grid">
        {profiles.map((profile) => {
          const isActive = activeProfileId === profile.id;
          return (
            <button
              key={profile.id}
              className={`profile-card-btn ${isActive ? "active" : ""}`}
              onClick={() => onSelect(profile)}
              type="button"
            >
              <div className="profile-card-top">
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  {getProfileIcon(profile.id)}
                  <span className="profile-card-name">{profile.request.name}</span>
                </span>
                <span className={getBadgeClass(profile.id)}>
                  {profile.id.replace("perfil-", "P").split("-")[0].toUpperCase()}
                </span>
              </div>
              <p className="profile-card-desc">{profile.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
