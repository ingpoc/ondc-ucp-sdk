declare function signMessage(_message: string): Promise<string>;
declare function verifySignature(_message: string, _signature: string, _publicKey: string): boolean;

export { signMessage, verifySignature };
