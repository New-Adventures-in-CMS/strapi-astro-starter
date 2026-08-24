#!/usr/bin/env node
// Libera le porte prima di `npm run dev`. Nessuna dipendenza esterna.
const { execSync } = require("child_process");

const PORTS = [1337, 4321];

for (const port of PORTS) {
  let output;
  try {
    output = execSync(`lsof -ti tcp:${port}`, { encoding: "utf8" }).trim();
  } catch (e) {
    // lsof esce con codice 1 se nessun processo, oppure non esiste
    if (e.status === 1 && e.stdout.trim() === "") {
      console.log(`  porta ${port}: già libera`);
    } else if (
      e.code === "ENOENT" ||
      /not found|command not found/i.test(e.message)
    ) {
      console.log(`  porta ${port}: lsof non disponibile, salto`);
    } else {
      // lsof assente su questo OS — degrada silenziosamente
      console.log(`  porta ${port}: lsof non disponibile, salto`);
    }
    continue;
  }

  if (!output) {
    console.log(`  porta ${port}: già libera`);
    continue;
  }

  const pids = output.split("\n").filter(Boolean);
  for (const pid of pids) {
    try {
      process.kill(Number(pid), "SIGTERM");
    } catch (_) {
      // processo già terminato
    }
  }
  console.log(`  porta ${port}: liberata (PID ${pids.join(", ")})`);
}

process.exit(0);
