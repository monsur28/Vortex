
import { encryptUrl } from "./src/lib/encryption.js";

async function test() {
  const url = "http://example.com/segment.ts";
  const res = await encryptUrl(url);
  console.log(typeof res, res);
}
test();

