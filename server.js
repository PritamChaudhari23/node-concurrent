const WebSocket = require("ws");

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

let messagesProcessed = 0;
let totalInt = 0;
let totalFloat = 0;
let trueFlags = 0;
let falseFlags = 0;
let clients = new Set();

wss.on("connection", (ws) => {
  clients.add(ws);

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      // Update stats
      messagesProcessed++;
      if (typeof data.valueInt === "number") totalInt += data.valueInt;
      if (typeof data.valueFloat === "number") totalFloat += data.valueFloat;
      if (typeof data.flag === "boolean") {
        if (data.flag) trueFlags++;
        else falseFlags++;
      }

      // Private reply
      ws.send(`Reply to client ${data.clientId}: received`);
    } catch {
      ws.send("Invalid JSON");
    }
  });

  ws.on("close", () => clients.delete(ws));
});

// Broadcast stats every 10 seconds
setInterval(() => {
  if (clients.size === 0) return;

  const avgInt = messagesProcessed ? totalInt / messagesProcessed : 0;
  const avgFloat = messagesProcessed ? totalFloat / messagesProcessed : 0;

  const broadcast = {
    totalClients: clients.size,
    avgInt,
    avgFloat,
    trueFlags,
    falseFlags,
    messagesProcessed,
    serverTime: Date.now(),
  };

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(broadcast));
    }
  }

  console.log("Broadcast:", broadcast);
}, 10000);

console.log("WebSocket server running on ws://localhost:8080/");
