import {preparedChunk} from "./types";
import {d} from "./util.js";

enum variableType {
    SIMPLE,
    FIELD,
    FUNCTION,
    LITERAL,
    TABLE,
}

type fieldParams = {
    name: string,
    table?: Variable,
    alias?: string
}

type funcParams = {
    funcName: string,
    alias?: string,
    params?: Variable[]
}

type tableParams = {
    name: string,
    alias?: string,
    database?: string
}

type literalParams = {
    expression: string | null
}

type simpleParam = string | number | boolean;

type variableParams = fieldParams | funcParams | literalParams | tableParams | simpleParam;

export class Variable {
    public readonly params: variableParams;
    private readonly type: variableType;

    private constructor(params: variableParams, type: variableType) {
        this.params = params;
        this.type = type;
    }

    parse(noCache = false): preparedChunk {
        let statement = '';
        let replacers = []
        if (this.type === variableType.SIMPLE) {
            const params = <simpleParam>this.params;
            statement = <string>(noCache ? `'${params}'` : '?');
            replacers = noCache ? [] : [this.params];
        }
        if (this.type === variableType.LITERAL) {
            const params = <literalParams>this.params;
            statement = params.expression;
        }
        if (this.type === variableType.FUNCTION) {
            const params = <funcParams>this.params;
            const pieces: string[] = [params.funcName, '('];
            const funcData = params.params.map(param => param.parse(true));
            if (noCache) {
                pieces.push(funcData.map(item => item.statement).join(', '))
            } else {
                pieces.push(funcData.map(item => {
                    replacers.push(item.statement)
                    return '?'
                }).join(', '))
            }
            pieces.push(')');
            if (params.alias) {
                pieces.push(`as ${params.alias}`);
            }
            statement = pieces.join(' ');
        }
        if (this.type === variableType.TABLE) {
            const params = <tableParams>this.params;
            const pieces = [];
            if (params?.database) {
                pieces.push(`\`${params.database}\`.`)
            }
            pieces.push(`\`${params.name}\``);
            if (params.alias) {
                pieces.push(` as ${params.alias}`);
            }
            if (noCache) {
                statement = pieces.join('');
            } else {
                statement = '?';
                replacers = [pieces.join('')];
            }
        }
        if (this.type === variableType.FIELD) {
            const pieces = [];
            const params = <fieldParams>this.params;
            if (params?.table) {
                pieces.push(`${params.table.parse(true).statement}.`);
            }
            pieces.push(`\`${params.name}\``);
            if (params.alias) {
                pieces.push(` as ${params.alias}`);
            }
            if (noCache) {
                statement = pieces.join('');
            } else {
                statement = '?';
                replacers = [pieces.join('')];
            }
        }

        if(noCache){
            replacers.forEach(replace => {
                statement = statement.replace('?', <string> replace);
            })
            replacers = [];

        }

        return {statement, replacers}

    }

    static simple(params: simpleParam) {
        return new Variable(params, variableType.SIMPLE);
    }

    static literal(params: literalParams) {
        return new Variable(params, variableType.LITERAL)
    }

    static func(params: funcParams) {
        return new Variable(params, variableType.FUNCTION)
    }

    static field(params: fieldParams) {
        return new Variable(params, variableType.FIELD)
    }

    static table(params: tableParams) {
        return new Variable(params, variableType.TABLE)
    }
}
