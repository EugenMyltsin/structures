import {parseVariable, Variable} from "./variable.js";
import {preparedChunk} from "./types";

enum conditionType {
    EQUALS = 'EQUALS',
    IN = 'IN',
    BETWEEN = 'BETWEEN',
}

type conditionChunkType = {
    key: Variable,
    value?: [

    ] | Variable
}

function parseConditionEquals(cond: conditionChunkType): preparedChunk {
    const replacers = [];
    const pieces = [];
    const key = parseVariable(cond.key);
    const value = parseVariable(cond.value);
    replacers.push(key.replacers);
    replacers.push(value.replacers);
    pieces.push(key.statement);
    pieces.push('=');
    pieces.push(value.statement);
    return {
        statement: pieces.join(' '),
        replacers: replacers.flat()
    }
}

function parseConditionIn(cond: conditionChunkType): preparedChunk {
    const replacers = [];
    const pieces = [];
    const key = parseVariable(cond.key);
    const value = parseVariable(cond.value);
    replacers.push(key.replacers);
    replacers.push(value.replacers);
    pieces.push(key.statement);
    pieces.push('=');
    pieces.push(value.statement);
    return {
        statement: pieces.join(' '),
        replacers: replacers.flat()
    }
}

export function parseCondition(cond: Condition) {
    if (cond.type === conditionType.EQUALS) {
        return parseConditionEquals(cond.params);
    }
}

export class Condition {
    public readonly type: conditionType;
    public readonly params: conditionChunkType;

    private constructor(params: conditionChunkType, type: conditionType) {
        this.type = type
        this.params = params
    }

    static equals(params: conditionChunkType) {
        return new Condition(params, conditionType.EQUALS);
    }

    static includes(params: conditionChunkType) {
        return new Condition(params, conditionType.EQUALS);
    }
}
