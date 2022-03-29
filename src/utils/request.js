/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import {message} from 'antd';
import {formatMessage} from 'umi';
import {extend} from 'umi-request';
import {GLOBAL_MESSAGE, REQUEST_CODE} from '../constant';

const requestList = [];

const messageList = [];

const exist = url => {
    for (const index in requestList) {
        if (requestList[index].url === url) {
            return index;
        }
    }
    return false;
}

/**
 * 异常处理程序
 */
const errorRequest = async response => {
    const index = exist(response.url);
    if (index !== false) {
        const needReloadRequest = requestList[index];
        if (response && (response.status === REQUEST_CODE.serverTimeout || response.status === REQUEST_CODE.serverOverload)) {
            if (needReloadRequest.reloadTimes <= 1) {
                const messageItem = message.loading({
                    content: formatMessage({id: 'error.timeout'}),
                    key: GLOBAL_MESSAGE.timeout,
                    duration: GLOBAL_MESSAGE.duration_0
                });
                messageList.push(messageItem);
                needReloadRequest.reloadTimes++;
                return new Promise(resolve => {
                    setTimeout(resolve, needReloadRequest.reloadTimes * 1000);
                }).then(() => {
                    return request(needReloadRequest.url, needReloadRequest.options);
                })
            } else {
                message.error({
                    content: formatMessage({id: 'error.network'}),
                    key: GLOBAL_MESSAGE.timeout,
                    duration: GLOBAL_MESSAGE.duration_5
                });
                messageList.length = 0;
                requestList.splice(index, 1);
                return {
                    code: REQUEST_CODE.connectError,
                    error: formatMessage({id: 'error.connect'}),
                };
            }
        }
    }
    messageList.forEach(item => {
        setTimeout(item, GLOBAL_MESSAGE.duration_3 * 1000);
    })
    messageList.length = 0;
    index !== false && requestList.splice(index, 1);
    return response;
};

/**
 * 异常处理程序
 */
const errorHandler = (error) => {
    console.log(error.message);
    if (error.message === "Failed to fetch") {
        return {
            code: REQUEST_CODE.connectError,
            error: {
                message: formatMessage({id: 'error.connect'})
            },
        }
    }
    const {response} = error;
    return {
        error: {
            message: formatMessage({id: 'error.host'})
        },
        status: response?.status,
        response,
    };
};

/**
 * 配置request请求时的默认参数
 */
const request = extend({
    errorHandler, // 默认错误处理
    credentials: 'include', // 默认请求是否带上cookie
    prefix: '', // constants.REQUEST_PERFIX,
    timeout: 5000,
    // requestType: 'json',
    Accept: 'application/json',
    getResponse: false, // 是否获取源 response, 返回结果将包裹一层
});

request.interceptors.request.use((url, options) => {
    const headers = {...options.headers};
    if (exist(url) === false) {
        const timer = new Date().getTime();
        requestList.push({
            id: timer,
            url,
            options: {
                ...options,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                    ...headers,
                },
            },
            reloadTimes: 0,
        })
    }
    return {
        url,
        options: {
            ...options,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                ...headers,
            },
        },
    };
});

request.interceptors.response.use((response) => {
    return errorRequest(response);
});

export default request;
