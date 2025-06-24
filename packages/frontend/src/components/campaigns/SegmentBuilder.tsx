// src/components/campaigns/SegmentBuilder.tsx
import React, { useState } from "react";
// Removidos: Plus, Filter - no utilizados
import { X, Users } from "lucide-react";
import Card, { CardContent, CardHeader, CardTitle } from "../ui/Card";
import Button from "../ui/Button";
import Input from "../ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface SegmentCriteria {
  id: string;
  field: string;
  operator: string;
  value: string;
}

interface SegmentBuilderProps {
  onSegmentChange: (criteria: SegmentCriteria[]) => void;
  initialCriteria?: SegmentCriteria[];
}

export const SegmentBuilder: React.FC<SegmentBuilderProps> = ({
  onSegmentChange,
  initialCriteria = [],
}) => {
  const [criteria, setCriteria] = useState<SegmentCriteria[]>(initialCriteria);
  const [previewCount, setPreviewCount] = useState<number>(0);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const fieldOptions = [
    { value: "status", label: "Estado" },
    { value: "source", label: "Fuente" },
    { value: "tags", label: "Etiquetas" },
    { value: "budgetRange", label: "Rango de Presupuesto" },
    { value: "travelStyle", label: "Estilo de Viaje" },
    { value: "destination", label: "Destino" },
    { value: "createdAt", label: "Fecha de Registro" },
    { value: "lastContact", label: "Último Contacto" },
  ];

  const operatorOptions = {
    text: [
      { value: "equals", label: "Es igual a" },
      { value: "contains", label: "Contiene" },
      { value: "not_contains", label: "No contiene" },
    ],
    select: [
      { value: "equals", label: "Es igual a" },
      { value: "not_equals", label: "No es igual a" },
    ],
    date: [
      { value: "after", label: "Después de" },
      { value: "before", label: "Antes de" },
      { value: "between", label: "Entre" },
    ],
    array: [
      { value: "contains", label: "Contiene" },
      { value: "not_contains", label: "No contiene" },
    ],
  };

  const getFieldType = (field: string) => {
    switch (field) {
      case "status":
      case "source":
      case "budgetRange":
      case "travelStyle":
        return "select";
      case "createdAt":
      case "lastContact":
        return "date";
      case "tags":
      case "destination":
        return "array";
      default:
        return "text";
    }
  };

  const getFieldOptions = (field: string) => {
    switch (field) {
      case "status":
        return [
          { value: "INTERESADO", label: "Interesado" },
          { value: "PASAJERO", label: "Pasajero" },
          { value: "CLIENTE", label: "Cliente" },
        ];
      case "source":
        return [
          { value: "WEBSITE", label: "Sitio Web" },
          { value: "REFERRAL", label: "Referido" },
          { value: "SOCIAL_MEDIA", label: "Redes Sociales" },
          { value: "ADVERTISING", label: "Publicidad" },
        ];
      case "budgetRange":
        return [
          { value: "LOW", label: "Bajo" },
          { value: "MEDIUM", label: "Medio" },
          { value: "HIGH", label: "Alto" },
          { value: "LUXURY", label: "Lujo" },
        ];
      case "travelStyle":
        return [
          { value: "ADVENTURE", label: "Aventura" },
          { value: "RELAXATION", label: "Relax" },
          { value: "CULTURAL", label: "Cultural" },
          { value: "BUSINESS", label: "Negocios" },
        ];
      default:
        return [];
    }
  };

  const addCriteria = () => {
    const newCriteria: SegmentCriteria = {
      id: `criteria_${Date.now()}`,
      field: "status",
      operator: "equals",
      value: "",
    };
    const updatedCriteria = [...criteria, newCriteria];
    setCriteria(updatedCriteria);
    onSegmentChange(updatedCriteria);
  };

  const removeCriteria = (id: string) => {
    const updatedCriteria = criteria.filter((c) => c.id !== id);
    setCriteria(updatedCriteria);
    onSegmentChange(updatedCriteria);
  };

  const updateCriteria = (
    id: string,
    field: keyof SegmentCriteria,
    value: string
  ) => {
    const updatedCriteria = criteria.map((c) =>
      c.id === id ? { ...c, [field]: value } : c
    );
    setCriteria(updatedCriteria);
    onSegmentChange(updatedCriteria);
  };

  const previewSegment = async () => {
    setIsPreviewLoading(true);
    try {
      // Simular llamada a API para obtener preview
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockCount = Math.floor(Math.random() * 500) + 50;
      setPreviewCount(mockCount);
    } catch (error) {
      console.error("Error previewing segment:", error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const renderValueInput = (criteria: SegmentCriteria) => {
    const fieldType = getFieldType(criteria.field);
    const fieldOptions = getFieldOptions(criteria.field);

    if (fieldType === "select" && fieldOptions.length > 0) {
      return (
        <Select
          value={criteria.value}
          onValueChange={(value) => updateCriteria(criteria.id, "value", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar valor" />
          </SelectTrigger>
          <SelectContent>
            {fieldOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (fieldType === "date") {
      return (
        <Input
          type="date"
          value={criteria.value}
          onChange={(e) => updateCriteria(criteria.id, "value", e.target.value)}
        />
      );
    }

    return (
      <Input
        type="text"
        value={criteria.value}
        onChange={(e) => updateCriteria(criteria.id, "value", e.target.value)}
        placeholder="Ingresa el valor"
      />
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Constructor de Segmentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Criteria List */}
          {criteria.map((criterion, index) => (
            <div
              key={criterion.id}
              className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
            >
              {index > 0 && (
                <div className="text-sm font-medium text-purple-600 dark:text-purple-400">
                  Y
                </div>
              )}

              {/* Field Selection */}
              <div className="flex-1">
                <Select
                  value={criterion.field}
                  onValueChange={(value) =>
                    updateCriteria(criterion.id, "field", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fieldOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Operator Selection */}
              <div className="flex-1">
                <Select
                  value={criterion.operator}
                  onValueChange={(value) =>
                    updateCriteria(criterion.id, "operator", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {operatorOptions[
                      getFieldType(
                        criterion.field
                      ) as keyof typeof operatorOptions
                    ]?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Value Input */}
              <div className="flex-1">{renderValueInput(criterion)}</div>

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeCriteria(criterion.id)}
                leftIcon={<X className="w-4 h-4" />}
              >
                Eliminar
              </Button>
            </div>
          ))}

          {/* Add Criteria Button */}
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={addCriteria}>
              Agregar Criterio
            </Button>

            {criteria.length > 0 && (
              <Button
                variant="outline"
                onClick={previewSegment}
                disabled={isPreviewLoading}
              >
                {isPreviewLoading ? "Cargando..." : "Vista Previa"}
              </Button>
            )}
          </div>

          {/* Preview Results */}
          {previewCount > 0 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-blue-900 dark:text-blue-100">
                  Este segmento incluye {previewCount.toLocaleString()}{" "}
                  contactos
                </span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {criteria.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Crea tu primer segmento
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Agrega criterios para segmentar tu audiencia
              </p>
              <Button onClick={addCriteria}>Agregar Primer Criterio</Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
