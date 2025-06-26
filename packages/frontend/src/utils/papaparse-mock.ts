// src/utils/papaparse-mock.ts
// Mock simple de PapaParse para el desarrollo

export interface ParseResult {
  data: any[];
  errors: any[];
  meta: {
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    truncated: boolean;
    cursor: number;
    fields?: string[];
  };
}

export interface ParseConfig {
  header?: boolean;
  dynamicTyping?: boolean;
  skipEmptyLines?: boolean;
  complete?: (results: ParseResult) => void;
  error?: (error: any) => void;
  worker?: boolean;
  step?: (results: ParseResult) => void;
  encoding?: string;
  delimiter?: string;
  newline?: string;
  quoteChar?: string;
  escapeChar?: string;
  comments?: boolean | string;
  transform?: (value: string, field: string | number) => any;
  transformHeader?: (header: string, index: number) => string;
  preview?: number;
  fastMode?: boolean;
  beforeFirstChunk?: (chunk: string) => string | void;
  chunk?: (results: ParseResult, parser: any) => void;
  withCredentials?: boolean;
  download?: boolean;
}

class PapaParseClass {
  parse(input: string | File, config?: ParseConfig): ParseResult | void {
    if (!input) {
      const error = new Error("Input is required");
      if (config?.error) {
        config.error(error);
        return;
      }
      throw error;
    }

    // Si es un archivo, simular lectura asíncrona
    if (input instanceof File) {
      this.parseFile(input, config);
      return;
    }

    // Si es string, procesar directamente
    return this.parseString(input as string, config);
  }

  private parseFile(file: File, config?: ParseConfig): void {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const result = this.parseString(text, config);
        if (config?.complete && result) {
          config.complete(result);
        }
      } catch (error) {
        if (config?.error) {
          config.error(error);
        }
      }
    };

    reader.onerror = () => {
      const error = new Error("Failed to read file");
      if (config?.error) {
        config.error(error);
      }
    };

    reader.readAsText(file);
  }

  private parseString(text: string, config?: ParseConfig): ParseResult {
    try {
      const delimiter = config?.delimiter || this.detectDelimiter(text);
      const lines = text.split("\n").filter((line) => {
        if (config?.skipEmptyLines) {
          return line.trim().length > 0;
        }
        return true;
      });

      if (lines.length === 0) {
        return {
          data: [],
          errors: [],
          meta: {
            delimiter,
            linebreak: "\n",
            aborted: false,
            truncated: false,
            cursor: text.length,
          },
        };
      }

      const headers = config?.header
        ? this.parseRow(lines[0], delimiter)
        : undefined;
      const dataLines = config?.header ? lines.slice(1) : lines;

      const data: any[] = [];
      const errors: any[] = [];

      dataLines.forEach((line, index) => {
        try {
          const row = this.parseRow(line, delimiter);

          if (config?.header && headers) {
            // Convertir array a objeto con headers
            const rowObject: any = {};
            headers.forEach((header, i) => {
              let value = row[i] || "";

              // Dynamic typing
              if (config.dynamicTyping) {
                value = this.convertType(value);
              }

              rowObject[header] = value;
            });
            data.push(rowObject);
          } else {
            // Mantener como array
            const processedRow = config?.dynamicTyping
              ? row.map(this.convertType)
              : row;
            data.push(processedRow);
          }
        } catch (error) {
          errors.push({
            type: "FieldMismatch",
            code: "TooManyFields",
            message: `Error parsing row ${index + 1}`,
            row: index + 1,
          });
        }
      });

      return {
        data,
        errors,
        meta: {
          delimiter,
          linebreak: "\n",
          aborted: false,
          truncated: false,
          cursor: text.length,
          fields: headers,
        },
      };
    } catch (error) {
      throw new Error(
        `Parse error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private detectDelimiter(text: string): string {
    const delimiters = [",", ";", "\t", "|"];
    let maxCount = 0;
    let bestDelimiter = ",";

    delimiters.forEach((delimiter) => {
      const count = (text.match(new RegExp("\\" + delimiter, "g")) || [])
        .length;
      if (count > maxCount) {
        maxCount = count;
        bestDelimiter = delimiter;
      }
    });

    return bestDelimiter;
  }

  private parseRow(line: string, delimiter: string): string[] {
    // Simple CSV parsing - no maneja quotes complejas
    return line.split(delimiter).map((field) => field.trim());
  }

  private convertType(value: string): any {
    if (value === "") return "";

    // Boolean
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;

    // Number
    if (/^-?\d+\.?\d*$/.test(value)) {
      const num = parseFloat(value);
      return isNaN(num) ? value : num;
    }

    // Date (simple detection)
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value : date;
    }

    return value;
  }

  unparse(data: any[], config?: any): string {
    if (!Array.isArray(data) || data.length === 0) {
      return "";
    }

    const delimiter = config?.delimiter || ",";
    const newline = config?.newline || "\n";

    // Si el primer elemento es un objeto, extraer headers
    if (typeof data[0] === "object" && !Array.isArray(data[0])) {
      const headers = Object.keys(data[0]);
      const headerRow = headers.join(delimiter);
      const dataRows = data.map((row) =>
        headers.map((header) => row[header] || "").join(delimiter)
      );

      return [headerRow, ...dataRows].join(newline);
    }

    // Si son arrays, unir directamente
    return data
      .map((row) => (Array.isArray(row) ? row.join(delimiter) : String(row)))
      .join(newline);
  }
}

const Papa = new PapaParseClass();

export default Papa;
