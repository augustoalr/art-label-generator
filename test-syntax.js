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

    // 2. Validar data.json
    const dataJsonPath = path.join(rootDir, 'data.json');
    console.log(`Verificando existencia e integridad de data.json...`);

    if (!fs.existsSync(dataJsonPath)) {
        console.error(`[ERROR] El archivo data.json no existe en: ${dataJsonPath}`);
        process.exit(1);
    }

    try {
        const rawData = fs.readFileSync(dataJsonPath, 'utf-8');
        const parsed = JSON.parse(rawData);
        console.log(`[OK] data.json es válido (contiene ${Array.isArray(parsed) ? parsed.length + ' elementos' : typeof parsed}).`);
    } catch (parseError) {
        console.error(`[ERROR] Fallo al parsear data.json: ${parseError.message}`);
        process.exit(1);
    }

    console.log('--- Verificación completada con éxito. Código 0. ---');
    process.exit(0);
}

runSyntaxVerification();
