import { useState } from "react";
import { X, Send, Smartphone, Monitor, Tablet } from "lucide-react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
import { clsx } from "clsx";

interface EmailPreviewProps {
  htmlContent: string;
  subject: string;
  variables?: Array<{ name: string; type: string; required?: boolean }>;
  onClose: () => void;
  onSendTest?: (email: string, variables: Record<string, any>) => void;
}

export const EmailPreview = ({
  htmlContent,
  subject,
  variables = [],
  onClose,
  onSendTest,
}: EmailPreviewProps) => {
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );
  const [testEmail, setTestEmail] = useState("");
  const [variableValues, setVariableValues] = useState<Record<string, any>>({});
  const [showTestForm, setShowTestForm] = useState(false);

  // Procesar el contenido HTML reemplazando variables
  const processedContent = variables.reduce((content, variable) => {
    const value = variableValues[variable.name] || `{{${variable.name}}}`;
    return content.replace(
      new RegExp(`{{${variable.name}}}`, "g"),
      String(value)
    );
  }, htmlContent);

  const processedSubject = variables.reduce((subj, variable) => {
    const value = variableValues[variable.name] || `{{${variable.name}}}`;
    return subj.replace(new RegExp(`{{${variable.name}}}`, "g"), String(value));
  }, subject);

  const handleSendTest = () => {
    if (testEmail && onSendTest) {
      onSendTest(testEmail, variableValues);
      setShowTestForm(false);
    }
  };

  const viewModeStyles = {
    desktop: "w-full max-w-4xl",
    tablet: "w-full max-w-2xl",
    mobile: "w-full max-w-sm",
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-white">Vista Previa</h2>

            {/* View Mode Selector */}
            <div className="flex gap-1 p-1 glass rounded-lg">
              <button
                onClick={() => setViewMode("desktop")}
                className={clsx(
                  "p-2 rounded transition-all",
                  viewMode === "desktop"
                    ? "bg-primary-500 text-white"
                    : "text-white/60 hover:text-white"
                )}
                title="Vista Escritorio"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("tablet")}
                className={clsx(
                  "p-2 rounded transition-all",
                  viewMode === "tablet"
                    ? "bg-primary-500 text-white"
                    : "text-white/60 hover:text-white"
                )}
                title="Vista Tablet"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("mobile")}
                className={clsx(
                  "p-2 rounded transition-all",
                  viewMode === "mobile"
                    ? "bg-primary-500 text-white"
                    : "text-white/60 hover:text-white"
                )}
                title="Vista Móvil"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            {onSendTest && (
              <Button
                variant="glass"
                size="sm"
                onClick={() => setShowTestForm(!showTestForm)}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Enviar Prueba
              </Button>
            )}
            <Button
              variant="glass"
              size="sm"
              onClick={onClose}
              leftIcon={<X className="w-4 h-4" />}
            >
              Cerrar
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Variables Sidebar */}
          {variables.length > 0 && (
            <div className="w-80 border-r border-white/10 p-6 overflow-y-auto">
              <h3 className="text-lg font-medium text-white mb-4">Variables</h3>
              <div className="space-y-4">
                {variables.map((variable) => (
                  <Input
                    key={variable.name}
                    label={variable.name}
                    type={variable.type === "number" ? "number" : "text"}
                    value={variableValues[variable.name] || ""}
                    onChange={(e) =>
                      setVariableValues({
                        ...variableValues,
                        [variable.name]: e.target.value,
                      })
                    }
                    placeholder={`Valor para ${variable.name}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Preview Area */}
          <div className="flex-1 flex flex-col items-center justify-start p-6 overflow-y-auto bg-gray-100">
            <div
              className={clsx(
                "transition-all duration-300",
                viewModeStyles[viewMode]
              )}
            >
              {/* Email Header */}
              <div className="bg-white rounded-t-lg p-4 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                    <span className="text-white font-bold text-sm">B</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Bukialo Travel</p>
                    <p className="text-sm text-gray-500">
                      no-reply@bukialo.com
                    </p>
                  </div>
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  {processedSubject}
                </h1>
              </div>

              {/* Email Content */}
              <div
                className="bg-white rounded-b-lg p-6 shadow-lg"
                dangerouslySetInnerHTML={{ __html: processedContent }}
                style={{
                  fontFamily: "Arial, sans-serif",
                  lineHeight: "1.6",
                  color: "#333",
                }}
              />
            </div>
          </div>
        </div>

        {/* Test Email Form */}
        {showTestForm && (
          <div className="p-6 border-t border-white/10 glass">
            <div className="flex items-center gap-4">
              <Input
                type="email"
                placeholder="tu@email.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="primary"
                onClick={handleSendTest}
                disabled={!testEmail}
              >
                Enviar Prueba
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
