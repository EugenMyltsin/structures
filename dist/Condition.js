import { parseVariable } from "./variable.js";
var conditionType;
(function (conditionType) {
    conditionType["EQUALS"] = "EQUALS";
    conditionType["IN"] = "IN";
    conditionType["BETWEEN"] = "BETWEEN";
})(conditionType || (conditionType = {}));
function parseConditionEquals(cond) {
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
    };
}
export function parseCondition(cond) {
    if (cond.type === conditionType.EQUALS) {
        return parseConditionEquals(cond.params);
    }
}
export class Condition {
    constructor(params, type) {
        this.type = type;
        this.params = params;
    }
    static equals(params) {
        return new Condition(params, conditionType.EQUALS);
    }
}
//# sourceMappingURL=condition.js.map