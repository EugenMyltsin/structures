import {
    FIELD_TYPE,
    PLACEHOLDERS
} from "./constants.js";
import {
    defaultConditions, defaultFields,
    defaultJoins,
    defaultLimit,
    defaultOptions,
    defaultOrder,
    defaultTables
} from "./defaults.js";

class Query {

    template;
    replacers = [];
    values = [];

    constructor(template, {
        options,
        fields,
        tables,
        joins,
        filter,
        group,
        order,
        limit
    } = {
        options: defaultOptions,
        fields: [defaultFields],
        tables: [defaultTables],
        joins: [defaultJoins],
        filter: [defaultConditions],
        group: [],
        order: [defaultOrder],
        limit: defaultLimit
    }) {
        this.template = template;
        this.parseOptions(options);
        this.parseFields(fields);
        this.parseTables(tables);
        this.parseJoins(joins);
        this.parseFilter(filter);
        this.parseGroup(group);
        this.parseOrder(order);
        this.parseLimit(limit);
    }

    replace(placeholder, replacer) {
        return {placeholder, replacer}
    }

    makeFunction(field) {
        let funcBody = `${field.name}(${field.params.join(', ')})`
        if (field.alias) {
            funcBody += ` as ${field.alias}`
        }
        return funcBody;
    }

    makeFields(field) {
        let fieldBody = field.name;
        if (field?.alias) {
            fieldBody += ` as ${field.alias}`;
        }

        if (field?.tablename) {
            fieldBody = `${field.tablename}.${fieldBody}`
        }
        return fieldBody;
    }

    makeConditions(condition) {
        if (Array.isArray(condition)) {
            const conditions = condition.map(subCondition => this.makeConditions(subCondition)).join(' ')
            return `(${conditions})`;
        } else {
            if (condition?.logic) {
                return condition.logic;
            }
            let field = this.makeFields(condition.field)
            if (condition?.tablename) {
                field = `${condition.tablename}.${field}`
            }

            let value;
            if (condition.value?.name) {
                value = this.makeFields(condition.value)
            } else {
                value = '?';
                this.values.push(condition.value);
            }
            return `${field} ${condition.condition} ${value}`
        }
    }

    parseOptions(data) {
        if (data?.distinctType) {
            this.replacers.push(Query.replace(PLACEHOLDERS.DISTINCT_TYPE, data.distinctType))
        }
        if (data?.priority) {
            this.replacers.push(Query.replace(PLACEHOLDERS.PRIORITY, data.priority))
        }
        if (data?.straightJoin) {
            this.replacers.push(Query.replace(PLACEHOLDERS.IS_STRAIGHT_JOIN, data.straightJoin))
        }
        if (data?.straightJoin) {
            this.replacers.push(Query.replace(PLACEHOLDERS.IS_STRAIGHT_JOIN, data.straightJoin))
        }
        if (data?.resultType) {
            this.replacers.push(Query.replace(PLACEHOLDERS.IS_STRAIGHT_JOIN, data.resultType.join(' ')))
        }
        if (data?.sqlPreform) {
            this.replacers.push(Query.replace(PLACEHOLDERS.SQL_PREFORM, data.sqlPreform.join(' ')))
        }
    }

    parseFields(data) {
        const pieces = [];
        data.forEach((field) => {
            if (field.type === FIELD_TYPE.FUNCTION) {
                pieces.push(this.makeFunction(field))
            } else {
                pieces.push(this.makeFields(field))
            }
        })
        this.replacers.push(this.replace(PLACEHOLDERS.FIELDS, pieces.join(', ')))
    }

    parseTables(data) {
        const pieces = data.map((table) => {
            let tableBody = table.name;
            if (table?.alias) {
                tableBody += ` as ${table.alias}`;
            }
            return tableBody;
        })
        if (pieces.length) {
            this.replacers.push(this.replace(PLACEHOLDERS.FROM, `FROM ${pieces.join(', ')}`))
        }
    }

    parseJoins(data) {
        const pieces = data.map((join) => {
            let strPieces = []
            if (join?.type) strPieces.push(join.type);
            strPieces.push('JOIN');
            strPieces.push(join.name);
            if (join?.alias) {
                strPieces.push(`as ${join.alias}`);
            }
            if (join?.on) {
                const conditions = join.on.map(condition => this.makeConditions(condition))
                strPieces.push('on')
                strPieces.push(conditions.join(' '))
            }
            return strPieces.join(' ')
        })
        this.replacers.push(this.replace(PLACEHOLDERS.JOIN, pieces.join(' ')))
    }

    parseFilter(data) {
        const pieces = [];
        if (data?.length) {
            pieces.push('WHERE')
        }
        data.forEach(condition => {
            if (condition?.logic) {
                pieces.push(condition.logic)
            } else {
                pieces.push(this.makeConditions(condition))
            }
        })
        this.replacers.push(this.replace(PLACEHOLDERS.WHERE, pieces.join(' ')));
    }

    parseGroup(data) {
        if (data) {
            const groups = data.map(group => this.makeFields(group));
            this.replacers.push(this.replace(PLACEHOLDERS.GROUP, groups.join(", ")))
        }
    }

    parseOrder(data) {
        if (data) {
            const orders = data.map(order => {
                let field = this.makeFields(order.field);
                if(order?.direction){
                    field = `${field} ${order.direction}`;
                }
                return field
            });
            this.replacers.push(this.replace(PLACEHOLDERS.ORDER, orders.join(", ")))
        }
    }

    parseLimit(data) {
        if(data){
            this.replacers.push(this.replace(PLACEHOLDERS.LIMIT, `${data.limit (data.offset || '')}`))
        }
    }

    sanitize(template) {
        return template.replace(/%(\S+)/gsi, '').replace(/(\s){2,}/g, ' ');
    }

    get() {
        let template = this.template.toString();
        this.replacers.forEach(({placeholder, replacer}) => {
            template = template.replace(placeholder, replacer);
        })
        return {
            preparedStatement: this.sanitize(template),
            values: this.values
        }
    }

}
