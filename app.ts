import config from "config";
import net from "net";
import { program } from "commander";

import Message from "./message";
import makeVersionPayload from "./makeVersionPayload";
import makeGetdataPayload from "./makeGetdataPayload";

program
  .option("-v, --version")
  .option("-g, --getdata");
program.parse(process.argv);
const options = program.opts();

const port: number = config.get("port");
const ip: string = config.get("ip");

const client = new net.Socket();

client.connect(port, ip, () => {
  console.log(`Connected to: ${ip}:${port}`);
  if (options.version) {
    const versionPayload  = makeVersionPayload();
    const versionMessage = new Message("version", versionPayload).getData();

    client.write(versionMessage);
  }

  if (options.getdata) {
    const getdataPayload = makeGetdataPayload("36b8993e04ccbb5229ecc7752a4dbe2e32dc880b128db80a3709ed40c0ab83f6", 1);
    const getdataMessage = new Message("getdata", getdataPayload).getData();

    client.write(getdataMessage);
  }
});

client.on('data', (data) => {
  console.log(data.toString("hex"));
});

client.on('close', () => {
  console.log("Connection closed");
});