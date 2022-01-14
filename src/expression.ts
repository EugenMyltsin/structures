import {Condition} from "./condition.js";
import {d} from "./util.js";
import {preparedChunk} from "./types";

export enum logic {
    OR,
    AND,
    XOR,
}

type expressionType = (Condition | logic | (Condition | logic)[])[];

export function expression(params: expressionType, noCache?: boolean): preparedChunk {
    const pieces = [];
    let replacers = [];

    params.forEach((param: Condition | logic) => {
        if (Array.isArray(param)) {
            pieces.push("(");
            const chunk = expression(param, noCache);
            pieces.push(chunk.statement);
            replacers = [...replacers, ...chunk.replacers]
            pieces.push(")");
        } else {
            if (param instanceof Condition) {
                const chunk = param.parse(noCache);
                pieces.push(chunk.statement);
                replacers = [...replacers, ...chunk.replacers]
            } else {
                if (param === logic.OR) {
                    pieces.push("OR");
                }
                if (param === logic.AND) {
                    pieces.push("AND");
                }
                if (param === logic.XOR) {
                    pieces.push("XOR");
                }
            }
        }
    })
    return {statement: pieces.join(' '), replacers}
}
