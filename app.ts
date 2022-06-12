import config from "config";
import net from "net";

import makeVersionPayload from "./makeVersionPayload";
import makeMessage from "./message";

const port: number = config.get("port");
const ip: string = config.get("ip");

const version  = makeVersionPayload();
const message = makeMessage("version", version);

const client = new net.Socket();

client.connect(port, ip, () => {
  console.log(`Connected to: ${ip}:${port}`);
  client.write(message);
});

client.on('data', (data) => {
  console.log(data.toString("hex"));
});

client.on('close', () => {
  console.log("Connection closed");
});