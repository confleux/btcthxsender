import config from "config";
import pack from "./utils/pack";
import { createHash } from "crypto";
import net from "net";

const makeMsg = (cmd: string, payload: Buffer): Buffer => {
  const magic = pack("<L", config.get("magic"));

  const cmds: string = (cmd + "\0".repeat(12 - cmd.length));
  const command = pack("<12s", cmds);

  const length = pack("I", payload.length);

  const hash1 = createHash('sha256').update(payload.toString("hex")).digest("hex");
  const hash2 = createHash('sha256').update(hash1).digest();
  const check = hash2.subarray(0, 4);

  return Buffer.concat([magic, command, length, check, payload]);
}

const versionMessage = (): Buffer => {
  const version = pack("i", 60002);
  const services = pack("Q", 0);
  const timestamp = pack("q", Math.floor(Date.now() / 10) / 100);

  const addr_recv = Buffer.concat([
    pack("Q", 0),
    pack(">16s", "127.0.0.1"),
    pack(">H", 8333)
  ]);

  const addr_from = Buffer.concat([
    pack("Q", 0),
    pack(">16s", "127.0.0.1"),
    pack(">H", 8333)
  ]);

  const nonce = pack("Q", Math.random() * 122222222222222222222);
  const user_agent = pack("B", 0);
  const height = pack("i", 0);

  return Buffer.concat([version, services, timestamp, addr_recv, addr_from, nonce, user_agent, height]);
}

const port: number = config.get("port");
const ip: string = config.get("ip");

const server =  net.createServer((socket) => {
  socket.pipe(socket);
});

const version  = versionMessage();
const message = makeMsg("version", version);

const client = new net.Socket();
client.connect(port, ip, () => {
  console.log(`Connected to: ${ip}:${port}`);
  client.write(message);
});

client.on('data', (data) => {
  console.log(data);
});

client.on('close', () => {
  console.log("Connection closed");
})

