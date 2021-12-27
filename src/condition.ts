import {Variable} from "./variable.js";
import {preparedChunk} from "./types";
import {d} from "./util.js";

enum conditionType {
    EQUALS, // a = b
    LT, // a < b
    LTE, // a < b
    GT, // a > b
    GTE, // a >= b
    LIKE, // a LIKE b
    IS_NULL, // a IS NULL
    IN, // a in x,y, ...n)
    BETWEEN, // a BETWEEN x AND y
}

type conditionChunkType = {
    key: Variable,
    value?: Variable | Variable[]
    inverse?: boolean,
}

export class Condition {

    private params: conditionChunkType
    private readonly type: conditionType
    private readonly sign?: string;

    constructor(params: conditionChunkType, type: conditionType) {
        this.params = params;
        this.type = type;
        this.sign = this.getSign();
    }

    getSign(): string {
        if (this.type === conditionType.EQUALS) {
            return this.params.inverse ? '%key <> %value' : '%key = %value';
        }
        if (this.type === conditionType.LT) {
            return this.params.inverse ? '%key >= %value' : '%key < %value';
        }
        if (this.type === conditionType.LTE) {
            return this.params.inverse ? '%key > %value' : '%key <= %value';
        }
        if (this.type === conditionType.GT) {
            return this.params.inverse ? '%key <= %value' : '%key > %value';
        }
        if (this.type === conditionType.GTE) {
            return this.params.inverse ? '%key < %value' : '%key >= %value';
        }
        if (this.type === conditionType.LIKE) {
            return this.params.inverse ? '%key NOT LIKE %value' : '%key LIKE %value';
        }
        if (this.type === conditionType.IS_NULL) {
            return this.params.inverse ? '%key IS NOT NULL' : '%key IS NULL';
        }
        if (this.type === conditionType.IN) {
            return this.params.inverse ? '%key NOT IN (%values)' : '%key IN %values';
        }
        if (this.type === conditionType.BETWEEN) {
            return this.params.inverse ? '%key NOT BETWEEN %value1 and %value2' : '%key BETWEEN %value1 and %value2';
        }
        return ''
    }

    getExpression(key: preparedChunk, values: preparedChunk | preparedChunk[], noCache?: boolean): preparedChunk {
        let statement = this.sign;
        let replacers = [];
        statement = statement.replace(/%key/, key.statement);
        replacers = key.replacers;
        if (values) {
            if (Array.isArray(values)) {
                if (this.type === conditionType.BETWEEN) {
                    statement = statement.replace(/%value1/, values[0].statement)
                    statement = statement.replace(/%value2/, values[1].statement)
                    replacers = [...replacers, ...values[0].replacers, ...values[1].replacers];
                }
                if (this.type === conditionType.IN) {
                    statement = statement.replace(/%values/, '?');
                    const tmpValues = values.map(value => value.statement).flat().join(',');
                    replacers.push(`(${tmpValues})`)
                }
            } else {
                statement = statement.replace(/%value/, values.statement);
                replacers = [...replacers, ...values.replacers];
            }
        }

        return {
            statement,
            replacers
        }
    }

    parse(noCache?: boolean): preparedChunk {
        let replacers = [];
        let statement = '';

        const key = this.params.key.parse(noCache);
        let value
        if (this.params.value) {
            if (Array.isArray(this.params.value)) {
                value = this.params.value.map(val => val.parse(noCache));
            } else {
                value = this.params.value.parse(noCache);
            }
        } else {
            value = null
        }

        let expression: preparedChunk;
        if(this.type === conditionType.IN){
            expression = this.getExpression(key, value, true);
        }else{
            expression = this.getExpression(key, value, noCache);
        }
        statement = expression.statement
        replacers = expression.replacers;

        if(noCache){
            replacers.forEach(replace => {
                statement = statement.replace('?', <string> replace);
            })
            replacers = [];
        }

        return {statement, replacers}
    }
}

/**
 *  EQUALS, // a = b
 *     LT, // a < b
 *     LTE, // a < b
 *     GT, // a > b
 *     GTE, // a >= b
 *     LIKE, // a LIKE b
 *     IS_NULL, // a IS NULL
 *     IN, // a in x,y, ...n)
 *     BETWEEN, // a BETWEEN x AND y
 * @param params
 */

export function between(params: conditionChunkType) {
    return new Condition(params, conditionType.IN);
}

export function includes(params: conditionChunkType) {
    return new Condition(params, conditionType.IN);
}

export function isNull(params: conditionChunkType) {
    return new Condition(params, conditionType.IS_NULL);
}

export function like(params: conditionChunkType) {
    return new Condition(params, conditionType.LIKE);
}

export function equals(params: conditionChunkType) {
    return new Condition(params, conditionType.EQUALS);
}

export function less(params: conditionChunkType) {
    return new Condition(params, conditionType.LT);
}

export function lessOrEquals(params: conditionChunkType) {
    return new Condition(params, conditionType.LTE);
}

export function greater(params: conditionChunkType) {
    return new Condition(params, conditionType.GT);
}

export function greaterOrEquals(params: conditionChunkType) {
    return new Condition(params, conditionType.GTE);
}


//
// export function includes(params: conditionChunkType) {
//     return new Condition(params, conditionType.IN);
// }
// export function between(params: conditionChunkType) {
//     return new Condition(params, conditionType.BETWEEN);
// }
//
// export function isNull(params: conditionChunkType) {
//     return new Condition(params, conditionType.IS_NULL);
// }
// export function isNull(params: conditionChunkType) {
//     return new Condition(params, conditionType.IS_NULL);
// }
// export function isNull(params: conditionChunkType) {
//     return new Condition(params, conditionType.IS_NULL);
// }
// export function isNull(params: conditionChunkType) {
//     return new Condition(params, conditionType.IS_NULL);
// }
// export function isNull(params: conditionChunkType) {
//     return new Condition(params, conditionType.IS_NULL);
// }
// export function isNull(params: conditionChunkType) {
//     return new Condition(params, conditionType.IS_NULL);
// }
// export function isNull(params: conditionChunkType) {
//     return new Condition(params, conditionType.IS_NULL);
// }
// export function isNull(params: conditionChunkType) {
//     return new Condition(params, conditionType.IS_NULL);
// }
// export function isNull(params: conditionChunkType) {
//     return new Condition(params, conditionType.IS_NULL);
// }
// export function isNull(params: conditionChunkType) {
//     return new Condition(params, conditionType.IS_NULL);
// }
