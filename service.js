const Service = require("node-windows").Service;
const path = require("path");

const svc = new Service({
  name: "ControleEventos",
  description: "Serviço Node.js para rodar o sistema Buffet",
  script: path.join(__dirname, "server.js"),
  wait: 2,
  grow: 0.5,
  maxRestarts: 5,
  nodeOptions: ["--harmony", "--max_old_space_size=4096"],
});

// eventos
svc.on("install", () => {
  console.log("✅ Serviço instalado!");
  svc.start();
});

svc.on("uninstall", () => {
  console.log("🗑️ Serviço removido!");
});

// decide se instala ou desinstala baseado no argumento
const action = process.argv[2];

if (action === "uninstall") {
  svc.uninstall();
} else {
  svc.install();
}
