import React, { useState } from "react";
import { Copy, Check, Download, FileText, Code2, ShieldAlert } from "lucide-react";

interface DocumentViewerProps {
  files: Record<string, string>;
  onDownloadZip: () => void;
  isDownloading: boolean;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  files,
  onDownloadZip,
  isDownloading,
}) => {
  const fileKeys = Object.keys(files);
  const [activeFile, setActiveFile] = useState<string>(fileKeys[0] || "DECISIONES.md");
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    const content = files[activeFile] || "";
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback manual si clipboard API no está permitida
      const textarea = document.createElement("textarea");
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith(".gitignore")) return <ShieldAlert size={14} color="#f43f5e" />;
    if (filename.includes("INSTRUCCIONES")) return <Code2 size={14} color="#a855f7" />;
    return <FileText size={14} color="var(--accent-cyan)" />;
  };

  return (
    <div className="card" style={{ marginTop: "2rem" }}>
      <div className="tabs-header">
        <div className="file-tabs">
          {fileKeys.map((filename) => (
            <button
              key={filename}
              type="button"
              className={`file-tab-btn ${activeFile === filename ? "active" : ""}`}
              onClick={() => setActiveFile(filename)}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              {getFileIcon(filename)}
              <span>{filename}</span>
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCopy}
            style={{ fontSize: "0.8rem", padding: "0.4rem 0.85rem" }}
          >
            {copied ? (
              <>
                <Check size={14} color="#34d399" />
                <span style={{ color: "#34d399" }}>¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copiar</span>
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={onDownloadZip}
            disabled={isDownloading}
            style={{ fontSize: "0.8rem", padding: "0.4rem 1rem" }}
          >
            <Download size={14} />
            <span>{isDownloading ? "Empaquetando..." : "Descargar Paquete (.zip)"}</span>
          </button>
        </div>
      </div>

      <div className="code-viewer-container">
        <pre>{files[activeFile] || "No hay contenido disponible para este archivo."}</pre>
      </div>
    </div>
  );
};
