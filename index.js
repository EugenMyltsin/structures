import {
    BASIC_TEMPLATES,
    CONDITION_TYPES,
    FIELD_TYPE,
    LOGIC_TYPES,
    PLACEHOLDERS
} from "./constants.js";
import {defaultConditions, defaultJoins, defaultLimit, defaultOrder, defaultTables} from "./defaults.js";

const d = console.log;


class Query {

    template
    replacers = []

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

    makeFunction(field){
        let funcBody = `${field.name}(${field.params.join(', ')})`
        if(field.alias){
            funcBody += ` as ${field.alias}`
        }
        return funcBody;
    }

    makeFields(field){
        let fieldBody = field.name;
        if(field?.alias){
            fieldBody += ` as ${field.alias}`;
        }

        if(field?.tablename){
            fieldBody = `${field.tablename}.${fieldBody}`
        }
        return fieldBody;
    }

    makeConditions(condition){
        if(Array.isArray(condition)){
            const conditions = condition.map(subCondition => this.makeConditions(subCondition)).join(' ')
            return `(${conditions})`;
        }else{
            if(condition?.logic){
                return condition.logic;
            }
            const field = this.makeFields(condition.field)
            let value;
            if(condition.value?.name){
                value = this.makeFields(condition.value)
            }else{
                value = condition.value
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
            if(field.type === FIELD_TYPE.FUNCTION) {
                pieces.push(this.makeFunction(field))
            }else{
                pieces.push(this.makeFields(field))
            }
        })
        this.replacers.push(this.replace(PLACEHOLDERS.FIELDS, pieces.join(', ')))
    }

    parseTables(data) {
        const pieces = data.map((table) => {
            let tableBody = table.name;
            if(table?.alias){
                tableBody += ` as ${table.alias}`;
            }
            return tableBody;
        })
        if (pieces.length){
            this.replacers.push(this.replace(PLACEHOLDERS.FROM, `FROM ${pieces.join(', ')}`))
        }
    }

    parseJoins(data) {
        const pieces = data.map((join) => {
            let strPieces = []
            if(join?.type) strPieces.push(join.type);
            strPieces.push('JOIN');
            strPieces.push(join.name);
            if(join?.alias){
                strPieces.push(`as ${join.alias}`);
            }
            if(join?.on){
                const conditions = join.on.map(condition => this.makeConditions(condition))
                strPieces.push('on')
                strPieces.push(conditions.join(' '))
            }
            return strPieces.join(' ')
        })
        this.replacers.push(this.replace(PLACEHOLDERS.JOIN, pieces.join('\n')))
    }

    parseFilter(data) {
        const pieces = [];
        if(data?.length){
            pieces.push('WHERE')
        }
        data.forEach(condition => {
            if(condition?.logic){
                pieces.push(condition.logic)
            }else{
                pieces.push(this.makeConditions(condition))
            }
        })
        this.replacers.push(this.replace(PLACEHOLDERS.WHERE, pieces.join(' ')));
    }

    parseGroup(data) {

    }

    parseOrder(data) {

    }

    parseLimit(data) {

    }

    sanitize(template){
        return template.replace(/%(\S+)/gsi, '').replace(/(\s){2,}/g, ' ');
    }

    get(){
        let template = this.template.toString();
        this.replacers.forEach(({placeholder, replacer}) => {
            template = template.replace(placeholder, replacer);
        })
        return this.sanitize(template)
    }

}

const x = new Query(BASIC_TEMPLATES.SELECT, {
    tables: [
        { name: 'limits_default'}
    ],
    fields: [
        {name:'limitName', tablename: 'spr_limits'},
        {name:'value', tablename: 'limits_default'},
    ],
    joins: [
        {
            name: 'subscriptions',
            on: [{
                field: {name: 'tariffID', type: FIELD_TYPE.SIMPLE},
                condition: CONDITION_TYPES.EQUAL,
                value: 1
            }]
        },
        {
            name: 'spr_limits',
            on: [{
                field: {name: 'tariffID', type: FIELD_TYPE.SIMPLE},
                condition: CONDITION_TYPES.EQUAL,
                value: {name: 'limitID', tablename: 'limits_default', type: FIELD_TYPE.SIMPLE}
            }]
        },
    ],
    filter: [
        [
        {field: {name: 'userID', type: FIELD_TYPE.SIMPLE}, tablename: 'subscriptions', condition: CONDITION_TYPES.EQUAL, value: 4},
        {logic: LOGIC_TYPES.OR},
            [
                {field: {name: 'userID', type: FIELD_TYPE.SIMPLE}, tablename: 'subscriptions', condition: CONDITION_TYPES.EQUAL, value: 5},
                {logic: LOGIC_TYPES.XOR},
                {field: {name: 'userID', type: FIELD_TYPE.SIMPLE}, tablename: 'subscriptions', condition: CONDITION_TYPES.EQUAL, value: 6}
            ]
        ]
    ]
})

d(x.get())
