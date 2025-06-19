import { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Link,
  Image,
  Type,
  Eye,
  Save,
  X,
} from "lucide-react";
import { EmailTemplate } from "../../services/email.service";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Card from "../ui/Card";
import { clsx } from "clsx";

interface EmailEditorProps {
  template?: EmailTemplate | null;
  onSave: (template: Partial<EmailTemplate>) => void;
  onCancel: () => void;
  onPreview: (content: string) => void;
}

const categories = [
  { value: "welcome", label: "Bienvenida" },
  { value: "quote", label: "Cotización" },
  { value: "follow_up", label: "Seguimiento" },
  { value: "seasonal", label: "Temporada" },
  { value: "post_trip", label: "Post-viaje" },
  { value: "custom", label: "Personalizado" },
];

export const EmailEditor = ({
  template,
  onSave,
  onCancel,
  onPreview,
}: EmailEditorProps) => {
  const [name, setName] = useState(template?.name || "");
  const [subject, setSubject] = useState(template?.subject || "");
  const [category, setCategory] = useState(template?.category || "welcome");
  const [htmlContent, setHtmlContent] = useState(template?.htmlContent || "");
  const [variables, setVariables] = useState(template?.variables || []);
  const [showVariables, setShowVariables] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setHtmlContent(editorRef.current.innerHTML);
    }
  };

  const insertVariable = (variableName: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement("span");
      span.className =
        "bg-primary-500/20 text-primary-300 px-2 py-1 rounded text-sm";
      span.textContent = `{{${variableName}}}`;
      span.contentEditable = "false";

      range.deleteContents();
      range.insertNode(span);

      // Update content
      if (editorRef.current) {
        setHtmlContent(editorRef.current.innerHTML);
      }
    }
  };

  const addVariable = () => {
    const name = prompt("Nombre de la variable:");
    if (name && !variables.find((v) => v.name === name)) {
      const newVariable = {
        name,
        type: "text" as const,
        required: false,
      };
      setVariables([...variables, newVariable]);
    }
  };

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const templateData: Partial<EmailTemplate> = {
      name,
      subject,
      category: category as any,
      htmlContent,
      variables,
      isActive: true,
    };

    onSave(templateData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">
            {template ? "Editar Plantilla" : "Nueva Plantilla"}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="glass"
              size="sm"
              onClick={() => onPreview(htmlContent)}
              leftIcon={<Eye className="w-4 h-4" />}
            >
              Vista Previa
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Guardar
            </Button>
            <Button
              variant="glass"
              size="sm"
              onClick={onCancel}
              leftIcon={<X className="w-4 h-4" />}
            >
              Cancelar
            </Button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r border-white/10 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Template Info */}
              <div>
                <h3 className="text-lg font-medium text-white mb-4">
                  Información
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Mi Plantilla"
                  />

                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-1">
                      Categoría
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="input-glass w-full"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input
                    label="Asunto"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="{{firstName}}, tu viaje te espera"
                  />
                </div>
              </div>

              {/* Variables */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Variables</h3>
                  <Button
                    size="sm"
                    variant="glass"
                    onClick={() => setShowVariables(!showVariables)}
                  >
                    {showVariables ? "Ocultar" : "Mostrar"}
                  </Button>
                </div>

                {showVariables && (
                  <div className="space-y-3">
                    {variables.map((variable, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 glass rounded"
                      >
                        <span
                          className="flex-1 cursor-pointer text-sm text-white/80"
                          onClick={() => insertVariable(variable.name)}
                        >
                          {variable.name}
                        </span>
                        <button
                          onClick={() => removeVariable(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <Button
                      size="sm"
                      variant="glass"
                      onClick={addVariable}
                      className="w-full"
                    >
                      + Agregar Variable
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => formatText("bold")}
                  className="p-2 rounded hover:bg-white/10"
                  title="Negrita"
                >
                  <Bold className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => formatText("italic")}
                  className="p-2 rounded hover:bg-white/10"
                  title="Cursiva"
                >
                  <Italic className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => formatText("underline")}
                  className="p-2 rounded hover:bg-white/10"
                  title="Subrayado"
                >
                  <Underline className="w-4 h-4 text-white" />
                </button>

                <div className="w-px h-6 bg-white/20 mx-2" />

                <button
                  onClick={() => {
                    const url = prompt("URL del enlace:");
                    if (url) formatText("createLink", url);
                  }}
                  className="p-2 rounded hover:bg-white/10"
                  title="Enlace"
                >
                  <Link className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={() => {
                    const url = prompt("URL de la imagen:");
                    if (url) formatText("insertImage", url);
                  }}
                  className="p-2 rounded hover:bg-white/10"
                  title="Imagen"
                >
                  <Image className="w-4 h-4 text-white" />
                </button>

                <div className="w-px h-6 bg-white/20 mx-2" />

                <select
                  onChange={(e) => formatText("fontSize", e.target.value)}
                  className="bg-transparent text-white text-sm border border-white/20 rounded px-2 py-1"
                >
                  <option value="1">Pequeño</option>
                  <option value="3">Normal</option>
                  <option value="5">Grande</option>
                  <option value="7">Muy Grande</option>
                </select>
              </div>
            </div>

            {/* Content Editor */}
            <div className="flex-1 p-6">
              <div
                ref={editorRef}
                contentEditable
                className="w-full h-full bg-white/5 rounded-lg p-4 text-white min-h-[400px] focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                style={{ overflowY: "auto" }}
                onInput={(e) => {
                  setHtmlContent((e.target as HTMLDivElement).innerHTML);
                }}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
