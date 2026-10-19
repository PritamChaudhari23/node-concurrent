const WebSocket = require("ws");

// Random 6-char alphanumeric ID
function generateClientId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Number of clients to simulate
const NUM_CLIENTS = 1000;

for (let i = 0; i < NUM_CLIENTS; i++) {
  const clientId = generateClientId();
  const ws = new WebSocket("ws://localhost:8080");

  ws.on("open", () => {
    console.log(`Client ${clientId} connected`);

    // Send JSON payload at random intervals
    setInterval(
      () => {
        const payload = {
          clientId,
          metric: "temperature",
          valueInt: Math.floor(Math.random() * 100),
          valueFloat: parseFloat((Math.random() * 50).toFixed(2)),
          flag: Math.random() > 0.5,
          timestamp: Date.now(),
        };

        ws.send(JSON.stringify(payload));
        console.log(`Client ${clientId} sent:`, payload);
      },
      Math.floor(Math.random() * 5000) + 2000,
    ); // 2–7 sec
  });

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`Client ${clientId} broadcast received:`, data);
    } catch {
      console.log(`Client ${clientId} private reply:`, message);
    }
  });
}
