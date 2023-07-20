interface record {
    type?: string | undefined;
    title?: string | undefined;
    author?: string | undefined;
    page?: number | undefined;
    start?: number | undefined;
    end?: number | undefined;
    time?: Date | undefined;
    text?: string | undefined;
}
export declare function toObject(text: string): record[];
export {};
