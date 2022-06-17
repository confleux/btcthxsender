import config from "config";
import net from "net";
import { program } from "commander";

import Message from "./message";
import makeVersionPayload from "./makeVersionPayload";
import makeGetdataPayload from "./makeGetdataPayload";
import makeTxPayload from "./makeTxPayload";

program
  .option("-v, --version")
  .option("-g, --getdata")
  .option("-t, --transaction");
program.parse(process.argv);
const options = program.opts();

const port: number = config.get("port");
const ip: string = config.get("ip");

const client = new net.Socket();

const previous_output: string = config.get("tx.previous_output");
const receiver_address: string = config.get("tx.receiver_address");
const my_address: string = config.get("tx.my_address");
const private_key: string = config.get("tx.private_key");

 client.connect(port, ip, () => {
   console.log(`Connected to: ${ip}:${port}`);
   if (options.version) {
     console.log("Sending version message");

     const versionPayload  = makeVersionPayload();
     const versionMessage = new Message("version", versionPayload);

     client.write(versionMessage.getData());
   }

   if (options.getdata) {
     console.log("Sending getdata message");

     const getdataPayload = makeGetdataPayload("36b8993e04ccbb5229ecc7752a4dbe2e32dc880b128db80a3709ed40c0ab83f6", 1);
     const getdataMessage = new Message("getdata", getdataPayload);

     client.write(getdataMessage.getData());
   }

   if (options.transaction) {
     console.log("Sending tx message");

     const txPayload = makeTxPayload(previous_output, receiver_address, my_address, private_key);
     const txMessage = new Message("tx", txPayload);

     console.log(txMessage.getData().toString("hex"));

     client.write(txMessage.getData());
   }
 });

 client.on('data', (data) => {
   console.log(data.toString("hex"));
 });

 client.on('close', () => {
   console.log("Connection closed");
 });