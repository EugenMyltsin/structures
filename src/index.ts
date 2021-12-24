import {cacheEnum, calcEnum, distinctEnum, priorityEnum, resultEnum, straightJoinEnum} from "./enums";
import {Variable} from "./variable.js";
import {Condition, parseCondition} from "./condition.js";
import {d} from "./util.js";

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
    filter?: any,
    group?: any,
    order?: any,
    limit?: any
}

const literal = Variable.literal({expression: 'SOME_LITERAL'});
const fn = Variable.fn({funcName: 'count', alias: 'cnt', params: ['userID']});
const field = Variable.field({name: 'userID', table: 'users'});
const table = Variable.table({name: 'user', alias: 'u', database: 'test'});

const eq = Condition.includes({key: field, value: [fn, 1, 'x']});
d(parseCondition(eq))
