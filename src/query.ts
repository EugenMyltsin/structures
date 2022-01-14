import {preparedChunk} from "./types";

export class Query{

    static create(chunks: preparedChunk[]): preparedChunk{
        return {statement: '', replacers: []}
    }
    static read(chunks: preparedChunk[]): preparedChunk{
        return {statement: '', replacers: []}
    }
    static update(chunks: preparedChunk[]): preparedChunk{
        return {statement: '', replacers: []}
    }
    static delete(chunks: preparedChunk[]): preparedChunk{
        return {statement: '', replacers: []}
    }

    execute({statement, replacers}: preparedChunk){

    }

}
