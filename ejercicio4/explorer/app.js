const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 8080;

const rutaBackups = "/home/backup";
const logAlertas = "/home/alertas_detectadas/alertas.log";

// Crear carpeta de alertas si no existe
if (!fs.existsSync("/home/alertas_detectadas")) {
    fs.mkdirSync("/home/alertas_detectadas", { recursive: true });
    console.log("Carpeta de alertas creada: /home/alertas_detectadas");
}

// Crear archivo de alertas si no existe
if (!fs.existsSync(logAlertas)) {
    fs.writeFileSync(logAlertas, "");
    console.log("Archivo de alertas creado:", logAlertas);
}

function procesarArchivo(ruta, contenido) {
    const palabras = contenido.split(/\s+/).filter(Boolean);
    const cantidadPalabras = palabras.length;
    const terminadasEnA = palabras.filter(p => p.endsWith("a")).length;
    const fechaHora = new Date().toLocaleString("es-UY");

    return `${fechaHora} | ${ruta} | total=${cantidadPalabras} | terminan_en_a=${terminadasEnA}`;
}

function revisarAlertas() {
    try {
        if (!fs.existsSync(rutaBackups)) {
            console.log("No existe la carpeta de backups.");
            return;
        }

        const carpetas = fs.readdirSync(rutaBackups).filter(nombre => {
            const rutaCompleta = path.join(rutaBackups, nombre);
            return fs.statSync(rutaCompleta).isDirectory();
        });
        console.log("Carpetas encontradas:", carpetas);

        carpetas.forEach(carpeta => {
            const rutaCarpeta = path.join(rutaBackups, carpeta);
            const archivos = fs.readdirSync(rutaCarpeta);
            console.log("Archivos en", carpeta, ":", archivos);

            archivos.forEach(nombreArchivo => {
                const archivoCompleto = path.join(rutaCarpeta, nombreArchivo);
                const contenido = fs.readFileSync(archivoCompleto, "utf8");
                console.log("Revisando archivo:", archivoCompleto);

                if (contenido.toLowerCase().includes("alarma")) {
                    console.log("Alarma detectada en:", archivoCompleto);

                    const lineaLog = procesarArchivo(`${carpeta}/${nombreArchivo}`, contenido);

                    const lineasLog = fs.existsSync(logAlertas)
                        ? fs.readFileSync(logAlertas, "utf8").split("\n").map(l => l.trim())
                        : [];

                    if (!lineasLog.includes(lineaLog.trim())) {
                        fs.appendFileSync(logAlertas, lineaLog);
                        console.log("Alerta registrada:", lineaLog.trim());
                    } else {
                        console.log("Alerta ya registrada:", lineaLog.trim());
                    }
                }
            });
        });
    } catch (error) {
        console.error("Error al analizar las alertas:", error.message);
    }
}

app.get("/", (req, res) => {
    revisarAlertas();

    let listadoBackups = [];

    try {
        if (fs.existsSync(rutaBackups)) {
            const carpetas = fs.readdirSync(rutaBackups).filter(nombre => {
                const rutaCompleta = path.join(rutaBackups, nombre);
                return fs.statSync(rutaCompleta).isDirectory();
            });

            carpetas.forEach(carpeta => {
                const archivos = fs.readdirSync(path.join(rutaBackups, carpeta));
                archivos.forEach(nombreArchivo => {
                    listadoBackups.push(`${carpeta}/${nombreArchivo}`);
                });
            });
        }
    } catch (err) {
        listadoBackups.push("(Error al leer la carpeta de backups: " + err.message + ")");
    }

    let contenidoAlertas = "";
    try {
        contenidoAlertas = fs.existsSync(logAlertas)
            ? fs.readFileSync(logAlertas, "utf8")
            : "(No se detectaron alertas)";
    } catch (err) {
        contenidoAlertas = "(Error al leer el log de alertas: " + err.message + ")";
    }

    res.send(`
        <html>
            <head>
                <title>Explorador</title>
                <meta charset="UTF-8" />
                <style>
                    body { font-family: Arial, sans-serif; margin: 1.5rem; }
                    h1 { color: #333; }
                    ul { margin-left: 1rem; }
                    pre { background: #f0f0f0; padding: 1rem; border-radius: 4px; }
                </style>
            </head>
            <body>
                <h1>Archivos Respaldados</h1>
                <ul>
                    ${listadoBackups.length > 0 ? listadoBackups.map(f => `<li>${f}</li>`).join("") : "<li>(No hay archivos respaldados)</li>"}
                </ul>

                <h1>Alertas Encontradas</h1>
                <pre>${contenidoAlertas}</pre>
            </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});