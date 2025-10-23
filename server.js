const { exec } = require("child_process");
const path = require("path");

const nextPath = path.join(__dirname, "node_modules", "next", "dist", "bin", "next");

// roda o comando "next start -p 3000"
const child = exec(`node "${nextPath}" start -p 60001`, {
  cwd: __dirname
});

child.stdout.on("data", (data) => {
  console.log(data.toString());
});

child.stderr.on("data", (data) => {
  console.error(data.toString());
});
