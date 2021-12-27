import { Condition } from "./condition.js";
export var logic;
(function (logic) {
    logic[logic["OR"] = 0] = "OR";
    logic[logic["AND"] = 1] = "AND";
    logic[logic["XOR"] = 2] = "XOR";
})(logic || (logic = {}));
export function expression(params, noCache) {
    const pieces = [];
    let replacers = [];
    params.forEach((param) => {
        if (Array.isArray(param)) {
            pieces.push("(");
            const chunk = expression(param, noCache);
            pieces.push(chunk.statement);
            replacers = [...replacers, ...chunk.replacers];
            pieces.push(")");
        }
        else {
            if (param instanceof Condition) {
                const chunk = param.parse(noCache);
                pieces.push(chunk.statement);
                replacers = [...replacers, ...chunk.replacers];
            }
            else {
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
    });
    return { statement: pieces.join(' '), replacers };
}
//# sourceMappingURL=expression.js.map