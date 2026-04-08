import { Client } from '../client';
export declare class Graphql {
    client: Client;
    constructor(client: Client);
    /**
     * GraphQL endpoint
     *
     * Execute a GraphQL mutation.
     *
     * @param {object} query
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    query(query: object): Promise<{}>;
    /**
     * GraphQL endpoint
     *
     * Execute a GraphQL mutation.
     *
     * @param {object} query
     * @throws {AppwriteException}
     * @returns {Promise<{}>}
     */
    mutation(query: object): Promise<{}>;
}
