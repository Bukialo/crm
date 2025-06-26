import { useState, useRef } from "react";
import { X, Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";
import Papa from "../../utils/papaparse-mock";
import Card, { CardContent } from "../ui/Card";
import Button from "../ui/Button";
import { contactsService } from "../../services/contacts.service";
import toast from "react-hot-toast";

interface ImportContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

export const ImportContactsModal = ({
  isOpen,
  onClose,
  onSuccess,
}: ImportContactsModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      toast.error("Por favor selecciona un archivo CSV");
      return;
    }

    setFile(selectedFile);
    setImportResult(null);

    // Preview CSV data
    Papa.parse(selectedFile, {
      header: true,
      preview: 5,
      complete: (results) => {
        setPreviewData(results.data);
      },
      error: (error) => {
        toast.error("Error al leer el archivo CSV");
        console.error(error);
      },
    });
  };

  const handleImport = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await contactsService.importContacts(file);
      setImportResult(result);

      if (result.success > 0) {
        toast.success(`${result.success} contactos importados exitosamente`);
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      } else {
        toast.error("No se pudo importar ningún contacto");
      }
    } catch (error) {
      toast.error("Error al importar contactos");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreviewData([]);
    setImportResult(null);
    onClose();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith(".csv")) {
      const event = {
        target: { files: [droppedFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleFileSelect(event);
    } else {
      toast.error("Por favor arrastra un archivo CSV");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Importar Contactos</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5 text-white/60" />
          </button>
        </div>

        <CardContent className="p-6">
          {!importResult ? (
            <>
              {/* File Upload Area */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-white/40 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <Upload className="w-12 h-12 text-white/40 mx-auto mb-4" />

                {!file ? (
                  <>
                    <p className="text-white mb-2">
                      Arrastra un archivo CSV aquí o
                    </p>
                    <Button
                      variant="glass"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Seleccionar Archivo
                    </Button>
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="w-6 h-6 text-primary-400" />
                    <span className="text-white">{file.name}</span>
                    <Button
                      size="sm"
                      variant="glass"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Cambiar
                    </Button>
                  </div>
                )}
              </div>

              {/* CSV Format Info */}
              <div className="mt-6 p-4 glass rounded-lg">
                <h3 className="text-sm font-medium text-white mb-2">
                  Formato requerido del CSV:
                </h3>
                <p className="text-sm text-white/60 mb-3">
                  El archivo debe incluir las siguientes columnas (los nombres
                  deben coincidir exactamente):
                </p>
                <code className="block p-3 bg-black/30 rounded text-xs text-white/80">
                  firstName, lastName, email, phone, status, source, tags,
                  budgetRange, preferredDestinations
                </code>
                <p className="text-xs text-white/40 mt-2">
                  * Los campos email, firstName y lastName son obligatorios
                </p>
              </div>

              {/* Preview Table */}
              {previewData.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-white mb-3">
                    Vista previa (primeras 5 filas):
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          {Object.keys(previewData[0]).map((key) => (
                            <th
                              key={key}
                              className="text-left py-2 px-3 text-white/60"
                            >
                              {key}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, index) => (
                          <tr key={index} className="border-b border-white/5">
                            {Object.values(row).map((value: any, i) => (
                              <td key={i} className="py-2 px-3 text-white/80">
                                {value || "-"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <Button variant="glass" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleImport}
                  disabled={!file || isUploading}
                  isLoading={isUploading}
                >
                  Importar Contactos
                </Button>
              </div>
            </>
          ) : (
            /* Import Results */
            <div className="space-y-6">
              <div className="text-center">
                {importResult.failed === 0 ? (
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                ) : (
                  <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                )}

                <h3 className="text-xl font-semibold text-white mb-2">
                  Importación Completada
                </h3>

                <div className="flex justify-center gap-6 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">
                      {importResult.success}
                    </p>
                    <p className="text-sm text-white/60">Importados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-400">
                      {importResult.failed}
                    </p>
                    <p className="text-sm text-white/60">Fallidos</p>
                  </div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="glass rounded-lg p-4">
                  <h4 className="text-sm font-medium text-white mb-3">
                    Errores encontrados:
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {importResult.errors.slice(0, 10).map((error, index) => (
                      <div key={index} className="text-sm text-red-400">
                        Fila {error.row}: {error.error}
                      </div>
                    ))}
                    {importResult.errors.length > 10 && (
                      <p className="text-sm text-white/60">
                        ... y {importResult.errors.length - 10} errores más
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-center">
                <Button variant="primary" onClick={handleClose}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
