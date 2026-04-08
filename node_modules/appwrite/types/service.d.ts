import { Client } from './client';
import type { Payload } from './client';
export declare class Service {
    /**
     * The size for chunked uploads in bytes.
     */
    static CHUNK_SIZE: number;
    client: Client;
    constructor(client: Client);
    static flatten(data: Payload, prefix?: string): Payload;
}
