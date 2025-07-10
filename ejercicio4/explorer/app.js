const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 8080;

const rutaBackups = "/home/backup";
const logAlertas = "/home/alertas_detectadas/alertas.log";

if (!fs.existsSync("/home/alertas_detectadas")) {
    fs.mkdirSync("/home/alertas_detectadas", { recursive: true });
    console.log("Carpeta de alertas creada: /home/alertas_detectadas");
}
if (!fs.existsSync(logAlertas)) {
    fs.writeFileSync(logAlertas, "");
    console.log("Archivo de alertas creado:", logAlertas);
}

app.get("/", (req, res) => {
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
    if (fs.existsSync(logAlertas)) {
        contenidoAlertas = fs.readFileSync(logAlertas, "utf8");
        console.log("Log de alertas leído en explorer:");
        console.log(contenidoAlertas);
    } else {
        console.log("⚠️ No existe el archivo de alertas:", logAlertas);
        contenidoAlertas = "(No se detectaron alertas)";
    }
} catch (err) {
    console.error("Error al leer el log de alertas:", err.message);
    contenidoAlertas = "(Error al leer el log de alertas: " + err.message + ")";
}

    res.send(`
    <html>
      <head>
        <title>Explorador de Backups</title>
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
          ${listadoBackups.length > 0 
            ? listadoBackups.map(f => `<li>${f}</li>`).join("")
            : "<li>(No hay archivos respaldados)</li>"}
        </ul>

        <h1>Alertas Detectadas</h1>
        <ul>
          ${contenidoAlertas.trim()
            ? contenidoAlertas.trim().split("\n").map(l => `<li>${l}</li>`).join("")
            : "<li>(No se detectaron alertas)</li>"}
        </ul>
      </body>
    </html>
  `);
});

app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});