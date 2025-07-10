const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const maquinas = [
  { name: "maquina1", path: "/mnt/maquina1" },
  { name: "maquina2", path: "/mnt/maquina2" },
  { name: "maquina3", path: "/mnt/maquina3" }
];

const backupRoot = "/home/backup";
const alertasDir = "/home/alertas_detectadas";
const logAlertas = path.join(alertasDir, "alertas.log");

if (!fs.existsSync(alertasDir)) {
    fs.mkdirSync(alertasDir, { recursive: true });
}

let alertasActuales = {};
if (fs.existsSync(logAlertas)) {
    fs.readFileSync(logAlertas, "utf8")
        .split("\n")
        .filter(Boolean)
        .forEach(linea => {
            const [_, ruta] = linea.split("|").map(s => s.trim());
            alertasActuales[ruta] = linea;
        });
}

let nuevasAlertas = {};

function calcularHash(archivo) {
    const contenido = fs.readFileSync(archivo);
    return crypto.createHash("sha256").update(contenido).digest("hex");
}

function procesarArchivo(rutaRelativa, contenido) {
    const palabras = contenido.split(/\s+/).filter(Boolean);
    const totalPalabras = palabras.length;
    const terminanEnA = palabras.filter(p => p.toLowerCase().endsWith("a")).length;
    const fechaHora = new Date().toLocaleString("es-UY");

    return `${rutaRelativa} | total=${totalPalabras} | terminan_en_a=${terminanEnA}`;
}

maquinas.forEach(maquina => {
    const origen = maquina.path;
    const destino = path.join(backupRoot, maquina.name);
    const archivoFirmas = path.join(backupRoot, `${maquina.name}_firmas.json`);

    if (!fs.existsSync(destino)) {
        fs.mkdirSync(destino, { recursive: true });
    }

    let firmas = {};
    if (fs.existsSync(archivoFirmas)) {
        firmas = JSON.parse(fs.readFileSync(archivoFirmas, "utf8"));
    }

    const archivos = fs.readdirSync(origen);
    archivos.forEach(archivo => {
        const rutaOrigen = path.join(origen, archivo);
        const rutaDestino = path.join(destino, archivo);
        const rutaRelativa = `${maquina.name}/${archivo}`;
        const hashActual = calcularHash(rutaOrigen);

        let contenido = fs.readFileSync(rutaOrigen, "utf8");
        let contieneAlarma = contenido.toLowerCase().includes("alarma");

        if (!firmas[archivo] || firmas[archivo] !== hashActual) {
            fs.copyFileSync(rutaOrigen, rutaDestino);
            firmas[archivo] = hashActual;
            console.log(`[+] Copiado: ${archivo} -> ${destino}`);
        } else {
            console.log(`[=] Sin cambios: ${archivo}`);
        }

        if (contieneAlarma) {
            nuevasAlertas[rutaRelativa] = procesarArchivo(rutaRelativa, contenido);
        }
    });

    fs.writeFileSync(archivoFirmas, JSON.stringify(firmas, null, 2));
});

fs.writeFileSync(logAlertas, Object.values(nuevasAlertas).join("\n"), "utf8");
console.log("Log de alertas actualizado.");