declare type QueryTypesSingle = string | number | boolean;
export declare type QueryTypesList = string[] | number[] | boolean[] | Query[];
export declare type QueryTypes = QueryTypesSingle | QueryTypesList;
declare type AttributesTypes = string | string[];
/**
 * Helper class to generate query strings.
 */
export declare class Query {
    method: string;
    attribute: AttributesTypes | undefined;
    values: QueryTypesList | undefined;
    /**
     * Constructor for Query class.
     *
     * @param {string} method
     * @param {AttributesTypes} attribute
     * @param {QueryTypes} values
     */
    constructor(method: string, attribute?: AttributesTypes, values?: QueryTypes);
    /**
     * Convert the query object to a JSON string.
     *
     * @returns {string}
     */
    toString(): string;
    /**
     * Filter resources where attribute is equal to value.
     *
     * @param {string} attribute
     * @param {QueryTypes} value
     * @returns {string}
     */
    static equal: (attribute: string, value: QueryTypes) => string;
    /**
     * Filter resources where attribute is not equal to value.
     *
     * @param {string} attribute
     * @param {QueryTypes} value
     * @returns {string}
     */
    static notEqual: (attribute: string, value: QueryTypes) => string;
    /**
     * Filter resources where attribute is less than value.
     *
     * @param {string} attribute
     * @param {QueryTypes} value
     * @returns {string}
     */
    static lessThan: (attribute: string, value: QueryTypes) => string;
    /**
     * Filter resources where attribute is less than or equal to value.
     *
     * @param {string} attribute
     * @param {QueryTypes} value
     * @returns {string}
     */
    static lessThanEqual: (attribute: string, value: QueryTypes) => string;
    /**
     * Filter resources where attribute is greater than value.
     *
     * @param {string} attribute
     * @param {QueryTypes} value
     * @returns {string}
     */
    static greaterThan: (attribute: string, value: QueryTypes) => string;
    /**
     * Filter resources where attribute is greater than or equal to value.
     *
     * @param {string} attribute
     * @param {QueryTypes} value
     * @returns {string}
     */
    static greaterThanEqual: (attribute: string, value: QueryTypes) => string;
    /**
     * Filter resources where attribute is null.
     *
     * @param {string} attribute
     * @returns {string}
     */
    static isNull: (attribute: string) => string;
    /**
     * Filter resources where attribute is not null.
     *
     * @param {string} attribute
     * @returns {string}
     */
    static isNotNull: (attribute: string) => string;
    /**
     * Filter resources where attribute is between start and end (inclusive).
     *
     * @param {string} attribute
     * @param {string | number} start
     * @param {string | number} end
     * @returns {string}
     */
    static between: (attribute: string, start: string | number, end: string | number) => string;
    /**
     * Filter resources where attribute starts with value.
     *
     * @param {string} attribute
     * @param {string} value
     * @returns {string}
     */
    static startsWith: (attribute: string, value: string) => string;
    /**
     * Filter resources where attribute ends with value.
     *
     * @param {string} attribute
     * @param {string} value
     * @returns {string}
     */
    static endsWith: (attribute: string, value: string) => string;
    /**
     * Specify which attributes should be returned by the API call.
     *
     * @param {string[]} attributes
     * @returns {string}
     */
    static select: (attributes: string[]) => string;
    /**
     * Filter resources by searching attribute for value.
     * A fulltext index on attribute is required for this query to work.
     *
     * @param {string} attribute
     * @param {string} value
     * @returns {string}
     */
    static search: (attribute: string, value: string) => string;
    /**
     * Sort results by attribute descending.
     *
     * @param {string} attribute
     * @returns {string}
     */
    static orderDesc: (attribute: string) => string;
    /**
     * Sort results by attribute ascending.
     *
     * @param {string} attribute
     * @returns {string}
     */
    static orderAsc: (attribute: string) => string;
    /**
     * Return results after documentId.
     *
     * @param {string} documentId
     * @returns {string}
     */
    static cursorAfter: (documentId: string) => string;
    /**
     * Return results before documentId.
     *
     * @param {string} documentId
     * @returns {string}
     */
    static cursorBefore: (documentId: string) => string;
    /**
     * Return only limit results.
     *
     * @param {number} limit
     * @returns {string}
     */
    static limit: (limit: number) => string;
    /**
     * Filter resources by skipping the first offset results.
     *
     * @param {number} offset
     * @returns {string}
     */
    static offset: (offset: number) => string;
    /**
     * Filter resources where attribute contains the specified value.
     *
     * @param {string} attribute
     * @param {string | string[]} value
     * @returns {string}
     */
    static contains: (attribute: string, value: string | string[]) => string;
    /**
     * Combine multiple queries using logical OR operator.
     *
     * @param {string[]} queries
     * @returns {string}
     */
    static or: (queries: string[]) => string;
    /**
     * Combine multiple queries using logical AND operator.
     *
     * @param {string[]} queries
     * @returns {string}
     */
    static and: (queries: string[]) => string;
}
export {};
