import { createHmac } from "node:crypto";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

/** The authenticator app's code (RFC 6238: SHA-1, 6 digits, 30 seconds) for a base32 setup key, `offset` steps from now. */
export function totp(secret: string, offset = 0): string {
	const bits = secret
		.replace(/\s+/g, "")
		.toUpperCase()
		.split("")
		.map(char => alphabet.indexOf(char).toString(2).padStart(5, "0"))
		.join("");
	const key = Buffer.from(bits.match(/.{8}/g)!.map(byte => parseInt(byte, 2)));
	const counter = Buffer.alloc(8);
	counter.writeBigUInt64BE(BigInt(Math.floor(Date.now() / 30_000) + offset));
	const hash = createHmac("sha1", key).update(counter).digest();
	const at = hash[19] & 0x0f;
	return String((hash.readUInt32BE(at) & 0x7fffffff) % 1_000_000).padStart(6, "0");
}
