var variableType;
(function (variableType) {
    variableType[variableType["SIMPLE"] = 0] = "SIMPLE";
    variableType[variableType["FIELD"] = 1] = "FIELD";
    variableType[variableType["FUNCTION"] = 2] = "FUNCTION";
    variableType[variableType["LITERAL"] = 3] = "LITERAL";
    variableType[variableType["TABLE"] = 4] = "TABLE";
})(variableType || (variableType = {}));
export class Variable {
    constructor(params, type) {
        this.params = params;
        this.type = type;
    }
    parse(noCache = false) {
        let statement = '';
        let replacers = [];
        if (this.type === variableType.SIMPLE) {
            const params = this.params;
            statement = (noCache ? `'${params}'` : '?');
            replacers = noCache ? [] : [this.params];
        }
        if (this.type === variableType.LITERAL) {
            const params = this.params;
            statement = params.expression;
        }
        if (this.type === variableType.FUNCTION) {
            const params = this.params;
            const pieces = [params.funcName, '('];
            const funcData = params.params.map(param => param.parse(true));
            if (noCache) {
                pieces.push(funcData.map(item => item.statement).join(', '));
            }
            else {
                pieces.push(funcData.map(item => {
                    replacers.push(item.statement);
                    return '?';
                }).join(', '));
            }
            pieces.push(')');
            if (params.alias) {
                pieces.push(`as ${params.alias}`);
            }
            statement = pieces.join(' ');
        }
        if (this.type === variableType.TABLE) {
            const params = this.params;
            const pieces = [];
            if (params?.database) {
                pieces.push(`\`${params.database}\`.`);
            }
            pieces.push(`\`${params.name}\``);
            if (params.alias) {
                pieces.push(` as ${params.alias}`);
            }
            if (noCache) {
                statement = pieces.join('');
            }
            else {
                statement = '?';
                replacers = [pieces.join('')];
            }
        }
        if (this.type === variableType.FIELD) {
            const pieces = [];
            const params = this.params;
            if (params?.table) {
                pieces.push(`${params.table.parse(true).statement}.`);
            }
            pieces.push(`\`${params.name}\``);
            if (params.alias) {
                pieces.push(` as ${params.alias}`);
            }
            if (noCache) {
                statement = pieces.join('');
            }
            else {
                statement = '?';
                replacers = [pieces.join('')];
            }
        }
        if (noCache) {
            replacers.forEach(replace => {
                statement = statement.replace('?', replace);
            });
            replacers = [];
        }
        return { statement, replacers };
    }
    static simple(params) {
        return new Variable(params, variableType.SIMPLE);
    }
    static literal(params) {
        return new Variable(params, variableType.LITERAL);
    }
    static func(params) {
        return new Variable(params, variableType.FUNCTION);
    }
    static field(params) {
        return new Variable(params, variableType.FIELD);
    }
    static table(params) {
        return new Variable(params, variableType.TABLE);
    }
}
//# sourceMappingURL=variable.js.map