const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function getJsFiles(dir, files = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        // Ignorar node_modules y carpetas ocultas/herramientas (.git, .agent)
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
            continue;
        }
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            getJsFiles(fullPath, files);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            files.push(fullPath);
        }
    }
    return files;
}

function runSyntaxVerification() {
    console.log('--- Iniciando verificación estática de sintaxis e integridad ---');

    // 1. Validar sintaxis de archivos .js
    const rootDir = __dirname;
    const jsFiles = getJsFiles(rootDir);
    console.log(`Verificando sintaxis de ${jsFiles.length} archivos .js...`);

    for (const file of jsFiles) {
        const relativePath = path.relative(rootDir, file);
        try {
            execSync(`node -c "${file}"`, { stdio: 'pipe' });
            console.log(`[OK] Sintaxis correcta: ${relativePath}`);
        } catch (error) {
            console.error(`[ERROR] Fallo de sintaxis en: ${relativePath}`);
            if (error.stderr) {
                console.error(error.stderr.toString());
            }
            process.exit(1);
        }
    }

    // 2. Validar ejemplo-catalogo.json
    const catalogExamplePath = path.join(rootDir, 'ejemplo-catalogo.json');
    console.log(`Verificando existencia e integridad de ejemplo-catalogo.json...`);

    if (!fs.existsSync(catalogExamplePath)) {
        console.error(`[ERROR] El archivo ejemplo-catalogo.json no existe en: ${catalogExamplePath}`);
        process.exit(1);
    }

    try {
        const rawCatalog = fs.readFileSync(catalogExamplePath, 'utf-8');
        const parsedCatalog = JSON.parse(rawCatalog);
        console.log(`[OK] ejemplo-catalogo.json es válido (contiene ${Array.isArray(parsedCatalog) ? parsedCatalog.length + ' elementos' : typeof parsedCatalog}).`);
    } catch (parseError) {
        console.error(`[ERROR] Fallo al parsear ejemplo-catalogo.json: ${parseError.message}`);
        process.exit(1);
    }

    // 3. Validar data.json (opcional/si existe)
    const dataJsonPath = path.join(rootDir, 'data.json');
    if (fs.existsSync(dataJsonPath)) {
        console.log(`Verificando integridad de data.json (archivo local detectado)...`);
        try {
            const rawData = fs.readFileSync(dataJsonPath, 'utf-8');
            const parsed = JSON.parse(rawData);
            console.log(`[OK] data.json es válido (contiene ${Array.isArray(parsed) ? parsed.length + ' elementos' : typeof parsed}).`);
        } catch (parseError) {
            console.error(`[ERROR] Fallo al parsear data.json: ${parseError.message}`);
            process.exit(1);
        }
    } else {
        console.log(`[INFO] data.json no está presente (omitido correctamente en entorno público).`);
    }

    console.log('--- Verificación completada con éxito. Código 0. ---');
    process.exit(0);
}

runSyntaxVerification();
