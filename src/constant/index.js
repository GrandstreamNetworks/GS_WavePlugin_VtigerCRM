const OPERATION_TYPE = {
    GET_CHALLENGE: 'getchallenge', // 授权
    LOGIN: 'login', // 登录
    QUERY: 'query', // 查询
    CREATE: 'create', // 创建
    LIST_TYPES: 'listtypes', // 列表
    RETRIEVE: 'retrieve',
    EVENT: 'Events',
};

const CRM_URL = {
    HOME: '/index.php',
    DETAIL_URL: '/index.php?module=Contacts&view=Detail&record=', // 联系人详情
    EDIT_URL: '/index.php?module=Contacts&view=Edit', // 新建联系人
}

const GLOBAL_MESSAGE = {
    timeout: 'global_message_timeout',
    error: 'global_message_error',
    success: 'global_message_success',
    info: 'global_message_info',
    warning: 'global_message_warning',
    duration_0: 0,
    duration_1: 1,
    duration_2: 2,
    duration_3: 3,
    duration_4: 4,
    duration_5: 5,
};

const REQUEST_CODE = {
    ok: 200,
    created: 201,
    deleted: 204,
    dataError: 400,
    noAuthority: 401,
    noFound: 404,
    serverError: 500,
    gatewayError: 502,
    serverOverload: 503,
    serverTimeout: 504,
    connectError: 'CONNECT_ERROR',
    invalidToken: 'INVALID_TOKEN',
    reConnect: 'RECONNECT',
};

const SESSION_STORAGE_KEY = {
    userInfo: 'userInfo',
    sessionId: 'sessionId',
    host: 'host',
    userId: ' userId',
}

const EVENT_KEY = {
    recvP2PIncomingCall: 'onRecvP2PIncomingCall', // 收到来电
    answerP2PCall: 'onAnswerP2PCall', // 接听来电
    hangupP2PCall: 'onHangupP2PCall', // 挂断来电
    rejectP2PCall: 'onRejectP2PCall', // 拒接来电
    initP2PCall: 'onInitP2PCall', // wave发去呼叫
    p2PCallCanceled: 'onP2PCallCanceled', // 未接来电、去电
    initPluginWindowOk: 'onInitPluginWindowOk', //初始化窗口成功
}

const WAVE_CALL_TYPE = {
    in: 'Inbound',
    out: 'Outbound',
    miss: 'Missed',
}

const DATE_FORMAT = {
    format_1: 'YYYY/MM/DD',
    format_2: 'YYYY/MM/DD HH/mm/ss',
    format_3: 'YYYY-MM-DD',
    format_4: 'YYYY-MM-DD HH:mm:ss',
    format_5: 'HH:mm:ss Z'
};

export {
    OPERATION_TYPE,
    CRM_URL,
    GLOBAL_MESSAGE,
    REQUEST_CODE,
    SESSION_STORAGE_KEY,
    EVENT_KEY,
    WAVE_CALL_TYPE,
    DATE_FORMAT
};
