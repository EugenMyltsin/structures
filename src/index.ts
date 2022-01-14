import {cacheEnum, calcEnum, distinctEnum, priorityEnum, resultEnum, straightJoinEnum} from "./enums";
import {Variable} from "./variable.js";
import {between, Condition, equals, includes, isNull} from "./condition.js";
import {d} from "./util.js";
import {expression, logic} from "./expression.js";
import {preparedChunk} from "./types";

type optionsType = {
    distinct?: distinctEnum,
    priority?: priorityEnum,
    straightJoin?: straightJoinEnum,
    result?: resultEnum[],
    cache?: cacheEnum,
    calc?: calcEnum
}

type queryParams = {
    options?: optionsType,
    fields?: Variable[],
    tables?: any
    joins?: any,
    filter?: preparedChunk,
    group?: any,
    order?: any,
    limit?: any
}

const simple = Variable.simple(1);
const literal = Variable.literal({expression: 'SOME_LITERAL'});
const table = Variable.table({name: 'user', database: 'test'});
const field = Variable.field({name: 'userID', table});
const func = Variable.func({funcName: 'count', params: [field]});
const cond = isNull({key: field})
const expr = expression([
    cond, logic.OR, [
        equals({key: func, value: Variable.simple(1)}),
        logic.AND,
        equals({key: func, value: Variable.simple(2)}),
    ]
], false);

d(expr)
