const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const maquinas = [
  { name: "maquina1", path: "/mnt/maquina1" },
  { name: "maquina2", path: "/mnt/maquina2" },
  { name: "maquina3", path: "/mnt/maquina3" }
];
const backupRoot = "/home/backup";

function calcularHash(archivo) {
    const contenido = fs.readFileSync(archivo);
    return crypto.createHash("sha256").update(contenido).digest("hex");
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
        const hashActual = calcularHash(rutaOrigen);

        if (!firmas[archivo] || firmas[archivo] !== hashActual) {
            fs.copyFileSync(rutaOrigen, rutaDestino);
            firmas[archivo] = hashActual;
            console.log(`[+] Copiado: ${archivo} -> ${destino}`);
        } else {
            console.log(`[=] Sin cambios: ${archivo}`);
        }
    });

    fs.writeFileSync(archivoFirmas, JSON.stringify(firmas, null, 2));
});