var variableType;
(function (variableType) {
    variableType["FIELD"] = "FIELD";
    variableType["FUNCTION"] = "FUNCTION";
    variableType["LITERAL"] = "LITERAL";
    variableType["TABLE"] = "TABLE";
})(variableType || (variableType = {}));
export function parseVariable(variable, noCahce = false) {
    if (!(variable instanceof Variable)) {
        let statement = '?';
        let replacers = [`'${variable}'`];
        if (typeof variable === typeof "string") {
            if (noCahce) {
                statement = `'${variable}'`;
                replacers = [];
            }
            else {
                replacers = [`'${variable}'`];
            }
        }
        else {
            if (noCahce) {
                statement = variable.toString();
                replacers = [];
            }
            else {
                replacers = [variable.toString()];
            }
        }
        return { statement, replacers };
    }
    else {
        let statement;
        let replacers = [];
        if (variable.type === variableType.LITERAL) {
            const params = variable.params;
            statement = params.expression;
            replacers = [];
        }
        if (variable.type === variableType.FIELD) {
            const pieces = [];
            const params = variable.params;
            if (params.table) {
                pieces.push(`${params.table}.`);
            }
            pieces.push(`${params.name}`);
            if (params.alias) {
                pieces.push(` as ${params.alias}`);
            }
            statement = pieces.join('');
            replacers = [];
        }
        if (variable.type === variableType.FUNCTION) {
            const params = variable.params;
            const pieces = [];
            pieces.push(`${params.funcName}`);
            if (params.params) {
                const paramList = [];
                params.params.forEach((param) => {
                    paramList.push('?');
                    replacers.push(param);
                });
                pieces.push(`(${paramList.join(', ')})`);
            }
            if (params.alias) {
                pieces.push(` as ${params.alias}`);
            }
            statement = pieces.join('');
        }
        if (variable.type === variableType.TABLE) {
            const pieces = [];
            const params = variable.params;
            if (params.database) {
                pieces.push(`\`${params.database}\`.`);
            }
            pieces.push(`\`${params.name}\``);
            if (params.alias) {
                pieces.push(` as ${params.alias}`);
            }
            statement = pieces.join('');
            replacers = [];
        }
        if (noCahce) {
            replacers.forEach(replacer => {
                statement = statement.replace('?', replacer);
            });
            replacers = [];
        }
        return { statement, replacers };
    }
}
export class Variable {
    constructor(params, type) {
        this.type = type;
        this.params = params;
    }
    static field(params) {
        return new Variable(params, variableType.FIELD);
    }
    static fn(params) {
        return new Variable(params, variableType.FUNCTION);
    }
    static literal(params) {
        return new Variable(params, variableType.LITERAL);
    }
    static table(params) {
        return new Variable(params, variableType.TABLE);
    }
}
//# sourceMappingURL=variable.js.map