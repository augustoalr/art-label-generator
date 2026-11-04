/**
 * catalog-importer.js — Módulo de Importación Masiva Amigable
 * Art Label Generator V7.0 — TASK-013
 *
 * Parsea texto TSV (portapapeles de Excel/Google Sheets) y archivos CSV/.xlsx
 * con detección automática de columnas por diccionario de sinónimos.
 *
 * UMD wrapper para compatibilidad con Vanilla JS sin bundler.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.CatalogImporter = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // ─── Diccionario de sinónimos de columnas ─────────────────────────────────
    const COLUMN_SYNONYMS = {
        id: ['id', 'asset_number', 'bien', 'nro_bien', 'nro. de bien', 'numero', 'inventario', 'num', 'nro', 'número', 'n°', 'no.'],
        author: ['autor', 'author', 'artista', 'creador', 'pintor', 'escultor', 'fotografo', 'fotógrafo'],
        title: ['titulo', 'título', 'title', 'nombre_obra', 'obra', 'nombre de la obra', 'nombre'],
        date: ['fecha', 'date', 'ano', 'año', 'periodo', 'período', 'year', 'anio'],
        technique: ['tecnica', 'técnica', 'technique', 'medio', 'material', 'materiales', 'media'],
        measurements: ['medidas', 'measurements', 'dimensiones', 'tamano', 'tamaño', 'size', 'dimension', 'dimensión'],
        description: ['descripcion', 'descripción', 'description', 'detalle', 'nota', 'notes', 'info'],
        room: ['sala', 'room', 'ubicacion', 'ubicación', 'location', 'espacio'],
    };

    // ─── Normalizar texto de encabezado para comparación ─────────────────────
    function normalizeHeader(text) {
        return (text || '')
            .toString()
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')  // quitar diacríticos
            .replace(/[^a-z0-9_.]/g, '_')     // reemplazar no-alfanumérico por _
            .replace(/_+/g, '_')               // colapsar múltiples _
            .replace(/^_|_$/g, '');            // recortar _ del inicio/fin
    }

    // ─── Mapear encabezados detectados al esquema canónico ───────────────────
    function mapColumns(headers) {
        const mapping = {};  // { canonicalKey: columnIndex }
        const usedIndexes = new Set();

        headers.forEach((rawHeader, index) => {
            const normalized = normalizeHeader(rawHeader);
            for (const [canonicalKey, synonymList] of Object.entries(COLUMN_SYNONYMS)) {
                if (mapping[canonicalKey] !== undefined) continue; // ya mapeado
                const normalizedSynonyms = synonymList.map(normalizeHeader);
                if (normalizedSynonyms.includes(normalized)) {
                    mapping[canonicalKey] = index;
                    usedIndexes.add(index);
                    break;
                }
            }
        });

        return mapping;
    }

    // ─── Parsear fila de texto en columnas (CSV o TSV) ────────────────────────
    function parseRow(line, delimiter) {
        if (delimiter === '\t') {
            // TSV: sin comillas escapadas normalmente
            return line.split('\t').map(cell => cell.trim().replace(/^"|"$/g, ''));
        }
        // CSV con soporte de comillas dobles RFC 4180 básico
        const cells = [];
        let cell = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    cell += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === delimiter && !inQuotes) {
                cells.push(cell.trim());
                cell = '';
            } else {
                cell += char;
            }
        }
        cells.push(cell.trim());
        return cells;
    }

    // ─── Detectar delimitador automáticamente ─────────────────────────────────
    function detectDelimiter(firstLine) {
        const tabCount = (firstLine.match(/\t/g) || []).length;
        const semicolonCount = (firstLine.match(/;/g) || []).length;
        const commaCount = (firstLine.match(/,/g) || []).length;
        if (tabCount > 0) return '\t';
        if (semicolonCount > commaCount) return ';';
        return ',';
    }

    // ─── Convertir filas mapeadas en objetos ArtLabel ─────────────────────────
    function rowsToArtLabels(dataRows, headers, columnMapping) {
        return dataRows
            .filter(row => row.some(cell => cell && cell.trim() !== ''))  // omitir filas vacías
            .map((row, rowIndex) => {
                const getValue = (canonicalKey) => {
                    const colIndex = columnMapping[canonicalKey];
                    return colIndex !== undefined ? (row[colIndex] || '').trim() : '';
                };

                const assetNumber = getValue('id') || `OBR-${rowIndex + 1}`;
                return {
                    id: assetNumber,
                    asset_number: assetNumber,
                    author: getValue('author'),
                    title: getValue('title'),
                    date: getValue('date'),
                    technique: getValue('technique'),
                    measurements: getValue('measurements'),
                    description: getValue('description'),
                    room: getValue('room') || '',
                    _importedAt: new Date().toISOString(),
                };
            });
    }

    // ─── API Pública ──────────────────────────────────────────────────────────

    /**
     * Parsea texto TSV/CSV en un resultado de importación.
     * @param {string} rawText — Texto pegado del portapapeles o leído del archivo.
     * @returns {{ headers: string[], columnMapping: object, artLabels: object[], warnings: string[] }}
     */
    function parseText(rawText) {
        const warnings = [];

        if (!rawText || !rawText.trim()) {
            return { headers: [], columnMapping: {}, artLabels: [], warnings: ['El texto está vacío.'] };
        }

        // Normalizar saltos de línea
        const lines = rawText
            .replace(/\r\n/g, '\n')
            .replace(/\r/g, '\n')
            .split('\n')
            .filter(line => line.trim() !== '');

        if (lines.length < 2) {
            return { headers: [], columnMapping: {}, artLabels: [], warnings: ['Se necesita al menos una fila de encabezados y una fila de datos.'] };
        }

        const delimiter = detectDelimiter(lines[0]);
        const headers = parseRow(lines[0], delimiter);
        const columnMapping = mapColumns(headers);

        const mappedCount = Object.keys(columnMapping).length;
        if (mappedCount === 0) {
            warnings.push('No se reconoció ninguna columna. Revisa que los encabezados coincidan con los nombres esperados (Autor, Título, Fecha, Técnica, Medidas, etc.).');
        } else if (mappedCount < 3) {
            warnings.push(`Solo se reconocieron ${mappedCount} columna(s). Considera usar encabezados más descriptivos.`);
        }

        const dataRows = lines.slice(1).map(line => parseRow(line, delimiter));
        const artLabels = rowsToArtLabels(dataRows, headers, columnMapping);

        return { headers, columnMapping, artLabels, warnings, delimiter };
    }

    /**
     * Lee un File (.csv o texto plano) y devuelve la promesa del resultado parseado.
     * @param {File} file
     * @returns {Promise<{ headers, columnMapping, artLabels, warnings }>}
     */
    function parseFile(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No se proporcionó ningún archivo.'));
                return;
            }

            const reader = new FileReader();
            reader.onload = function (event) {
                try {
                    const text = event.target.result;
                    // Si es JSON, intentar parsear directamente
                    if (file.name.toLowerCase().endsWith('.json')) {
                        const parsed = JSON.parse(text);
                        const artLabels = Array.isArray(parsed) ? parsed : [];
                        resolve({ headers: [], columnMapping: {}, artLabels, warnings: [], isJson: true });
                    } else {
                        resolve(parseText(text));
                    }
                } catch (err) {
                    reject(new Error('Error al leer el archivo: ' + err.message));
                }
            };
            reader.onerror = () => reject(new Error('Error al leer el archivo.'));
            reader.readAsText(file, 'UTF-8');
        });
    }

    /**
     * Genera el contenido de la plantilla CSV para descarga.
     * @returns {string} — Contenido CSV con BOM UTF-8 para compatibilidad con Excel.
     */
    function generateTemplateCsv() {
        const BOM = '\uFEFF';
        const headers = ['Nro. de Bien', 'Autor', 'Título', 'Fecha', 'Técnica', 'Medidas', 'Descripción', 'Sala'];
        const example1 = ['OBR-001', 'García Lorca, Federico', 'El Jardín de las Luces', '1932', 'Óleo sobre lienzo', '80 x 60 cm', 'Obra de la colección permanente', 'Sala 1'];
        const example2 = ['OBR-002', 'Anónimo, Siglo XVIII', 'Retrato de Dama con Abanico', 'c. 1750', 'Temple sobre tabla', '45 x 35 cm', '', 'Sala 2'];
        const rows = [headers, example1, example2]
            .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
            .join('\r\n');
        return BOM + rows;
    }

    /**
     * Retorna un resumen legible del mapeo de columnas detectado.
     * @param {string[]} headers
     * @param {object} columnMapping
     * @returns {string[]} — Array de strings descriptivos
     */
    function describeMappings(headers, columnMapping) {
        const LABELS = {
            id: 'Nro. de Bien',
            author: 'Autor',
            title: 'Título',
            date: 'Fecha',
            technique: 'Técnica',
            measurements: 'Medidas',
            description: 'Descripción',
            room: 'Sala',
        };
        return Object.entries(columnMapping).map(([canonical, colIndex]) => {
            return `"${headers[colIndex]}" → ${LABELS[canonical] || canonical}`;
        });
    }

    return {
        parseText,
        parseFile,
        generateTemplateCsv,
        describeMappings,
        COLUMN_SYNONYMS,
    };
}));
