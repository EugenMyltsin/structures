export enum distinctEnum {
    DEFAULT = '',
        ALL = 'ALL',
        DISTINCT = 'DISTINCT',
        DISTINCTROW = 'DISTINCTROW',
}

export enum priorityEnum {
    DEFAULT = '',
        HIGH_PRIORITY = 'HIGH_PRIORITY',
        LOW_PRIORITY = 'LOW_PRIORITY',
        DELAYED = 'DELAYED',
        QUICK = 'DELAYED',
}

export enum ignoreEnum {
    DEFAULT = '',
        HIGH_PRIORITY = 'IGNORE',
}

export enum straightJoinEnum {
    DEFAULT = '',
        STRAIGHT_JOIN = 'STRAIGHT_JOIN'
}

export enum resultEnum {
    DEFAULT = '',
        SQL_SMALL_RESULT = 'SQL_SMALL_RESULT',
        SQL_BIG_RESULT = 'SQL_BIG_RESULT',
        SQL_BUFFER_RESULT = 'SQL_BUFFER_RESULT',
}

export enum cacheEnum {
    DEFAULT = '',
        SQL_NO_CACHE = 'SQL_NO_CACHE',
}

export enum calcEnum {
    DEFAULT = '',
        SQL_CALC_FOUND_ROWS = 'SQL_CALC_FOUND_ROWS',
}
