import {CONDITION_TYPES, DISTINCT_TYPE, FIELD_TYPE, RESULT_TYPE, SORT_TYPES, SQL_PREFORM_TYPE} from "./constants.js";

export const defaultOptions = {
    distinctType: DISTINCT_TYPE.DEFAULT,
    priority: false,
    straightJoin: false,
    resultType: [RESULT_TYPE.DEFAULT],
    sqlPreform: [SQL_PREFORM_TYPE.DEFAULT]
};
export const defaultFields = {
    name: null,
    type: FIELD_TYPE.SIMPLE,
    alias: null,
    tablename: null,
    params: []
};
export const defaultTables = {
    name: null,
    alias: null
};
export const defaultJoins = {
    ...defaultTables,
    on: []
};
export const defaultConditions = {field: defaultFields, condition: CONDITION_TYPES, value: null}
export const defaultOrder = {field: null, direction: SORT_TYPES.ASC}
export const defaultLimit = {limit: null, offset: null}
