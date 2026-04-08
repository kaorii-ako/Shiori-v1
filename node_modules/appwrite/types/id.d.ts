/**
 * Helper class to generate ID strings for resources.
 */
export declare class ID {
    #private;
    /**
     * Uses the provided ID as the ID for the resource.
     *
     * @param {string} id
     * @returns {string}
     */
    static custom(id: string): string;
    /**
     * Have Appwrite generate a unique ID for you.
     *
     * @param {number} padding. Default is 7.
     * @returns {string}
     */
    static unique(padding?: number): string;
}
