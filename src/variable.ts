import {preparedChunk} from "./types";

enum variableType {
    FIELD = 'FIELD',
    FUNCTION = 'FUNCTION',
    LITERAL = 'LITERAL',
    TABLE = 'TABLE',
}

type fieldParams = {
    name: string,
    table?: string,
    alias?: string
}

type funcParams = {
    funcName: string,
    alias?: string,
    params?: (string | number | boolean | null)[]
}

type tableParams = {
    name: string,
    alias?: string,
    database?: string
}

type literalParams = {
    expression: string | null
}
export function parseVariable(variable: Variable | Variable[] | string | number, noCahce: boolean = false): preparedChunk {

    if (!(variable instanceof Variable)) {
        let statement: string = '?';
        let replacers = [`'${variable}'`];
        if(typeof variable === typeof "string"){
            if(noCahce){
                statement = `'${variable}'`;
                replacers = [];
            }else{
                replacers = [`'${variable}'`];
            }
        }else{
            if(noCahce){
                statement = variable.toString();
                replacers = [];
            }else{
                replacers = [variable.toString()]
            }
        }
        return  {statement, replacers}
    } else {
        let statement;
        let replacers = [];
        if (variable.type === variableType.LITERAL) {
            const params = <literalParams>variable.params;
            statement = params.expression;
            replacers = []
        }

        if (variable.type === variableType.FIELD) {
            const pieces = [];
            const params = <fieldParams>variable.params;
            if (params.table) {
                pieces.push(`${params.table}.`)
            }
            pieces.push(`${params.name}`)
            if (params.alias) {
                pieces.push(` as ${params.alias}`)
            }
            statement = pieces.join('');
            replacers = []
        }

        if (variable.type === variableType.FUNCTION) {
            const params = <funcParams>variable.params;
            const pieces = [];
            pieces.push(`${params.funcName}`)
            if (params.params) {
                const paramList = []
                params.params.forEach((param: string | number | boolean) => {
                    paramList.push('?');
                    replacers.push(param);
                })
                pieces.push(`(${paramList.join(', ')})`)
            }
            if (params.alias) {
                pieces.push(` as ${params.alias}`)
            }
            statement = pieces.join('')
        }

        if (variable.type === variableType.TABLE) {
            const pieces = [];
            const params = <tableParams>variable.params;
            if (params.database) {
                pieces.push(`\`${params.database}\`.`)
            }
            pieces.push(`\`${params.name}\``)
            if (params.alias) {
                pieces.push(` as ${params.alias}`)
            }
            statement = pieces.join('');
            replacers = [];
        }

        if(noCahce){
            replacers.forEach(replacer => {
                statement = statement.replace('?', replacer)
            })
            replacers = []
        }

        return  {statement, replacers}
    }
}

export class Variable {
    public readonly type: variableType;
    public readonly params: fieldParams | funcParams | literalParams | tableParams;

    private constructor(params: fieldParams | funcParams | literalParams | tableParams, type: variableType) {
        this.type = type
        this.params = params
    }

    static field(params: fieldParams) {
        return new Variable(params, variableType.FIELD)
    }

    static fn(params: funcParams) {
        return new Variable(params, variableType.FUNCTION)
    }

    static literal(params: literalParams) {
        return new Variable(params, variableType.LITERAL)
    }

    static table(params: tableParams) {
        return new Variable(params, variableType.TABLE)
    }
}
