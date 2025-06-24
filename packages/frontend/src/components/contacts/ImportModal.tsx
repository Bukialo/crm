// src/components/contacts/ImportModal.tsx
import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  FileText,
  Download,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<void>;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError("Por favor selecciona un archivo");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await onImport(selectedFile);
      setSuccess("Contactos importados exitosamente");
      setSelectedFile(null);

      // Auto-close after success
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al importar contactos"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validar tipo de archivo
    const allowedTypes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith(".csv")) {
      setError("Solo se permiten archivos CSV y Excel (.csv, .xls, .xlsx)");
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      setError("El archivo es muy grande. Tamaño máximo: 5MB");
      return;
    }

    setSelectedFile(file);
    setError(null);
    setSuccess(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const downloadTemplate = () => {
    const csvContent = [
      "firstName,lastName,email,phone,status,source,destinations,budgetRange,travelStyle,groupSize,tags",
      'María,García,maria@example.com,+54 11 1234-5678,INTERESADO,WEBSITE,"París, Roma",MEDIUM,RELAXATION,2,"VIP, Frecuente"',
      'Juan,Pérez,juan@example.com,+54 11 8765-4321,CLIENTE,REFERRAL,"Barcelona, Madrid",HIGH,CULTURAL,4,Corporativo',
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "template_contactos.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetModal = () => {
    setSelectedFile(null);
    setError(null);
    setSuccess(null);
    setLoading(false);
    setDragActive(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Importar Contactos
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Importa contactos desde un archivo CSV o Excel
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Template Download */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-blue-900 dark:text-blue-100">
                  ¿Primera vez importando?
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Descarga nuestro template para asegurar el formato correcto de
                  tus datos.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Descargar Template
                </button>
              </div>
            </div>
          </div>

          {/* File Upload Area */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-purple-400 bg-purple-50 dark:bg-purple-900/20"
                  : selectedFile
                    ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xls,.xlsx"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Archivo Seleccionado
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="mt-2 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                  >
                    Cambiar archivo
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Arrastra tu archivo aquí
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    o haz clic para seleccionar
                  </p>
                  <p className="text-sm text-gray-500">
                    Formatos soportados: CSV, XLS, XLSX (máx. 5MB)
                  </p>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <p className="text-red-600 dark:text-red-400 text-sm">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <p className="text-green-600 dark:text-green-400 text-sm">
                    {success}
                  </p>
                </div>
              </div>
            )}

            {/* Format Guidelines */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Formato Requerido:
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>
                  • <strong>Columnas obligatorias:</strong> firstName, lastName,
                  email
                </li>
                <li>
                  • <strong>Columnas opcionales:</strong> phone, status, source,
                  destinations, budgetRange, etc.
                </li>
                <li>
                  • <strong>Status válidos:</strong> INTERESADO, PASAJERO,
                  CLIENTE
                </li>
                <li>
                  • <strong>Sources válidos:</strong> WEBSITE, REFERRAL,
                  SOCIAL_MEDIA, ADVERTISING
                </li>
                <li>
                  • <strong>Listas separadas por comas:</strong> destinations,
                  tags, preferredSeasons
                </li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!selectedFile || loading}
                className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {loading ? "Importando..." : "Importar Contactos"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
