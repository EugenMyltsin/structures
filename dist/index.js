import { Variable } from "./variable.js";
import { equals, isNull } from "./condition.js";
import { d } from "./util.js";
import { expression, logic } from "./expression.js";
const simple = Variable.simple(1);
const literal = Variable.literal({ expression: 'SOME_LITERAL' });
const table = Variable.table({ name: 'user', database: 'test' });
const field = Variable.field({ name: 'userID', table });
const func = Variable.func({ funcName: 'count', params: [field] });
const cond = isNull({ key: field });
const expr = expression([
    cond, logic.OR, [
        equals({ key: func, value: Variable.simple(1) }),
        logic.AND,
        equals({ key: func, value: Variable.simple(2) }),
    ]
], false);
d(expr);
//# sourceMappingURL=index.js.map