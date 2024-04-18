import { stringify } from 'qs';
import request from '../utils/request';
import { OPERATION_TYPE, SESSION_STORAGE_KEY } from '@/constant';

export function getContact(callNum) {
    const params = {
        operation: OPERATION_TYPE.QUERY,
        sessionName: sessionStorage.getItem(SESSION_STORAGE_KEY.sessionId),
        query: `SELECT * FROM Contacts WHERE mobile = ${callNum} OR phone = ${callNum} OR homephone = ${callNum} OR otherphone = ${callNum} or fax = ${callNum};`,
    };
    const host = sessionStorage.getItem('host');
    return request(`${host}/webservice.php?${stringify(params)}`)
}

export function getLead(callNum) {
    const params = {
        operation: OPERATION_TYPE.QUERY,
        sessionName: sessionStorage.getItem(SESSION_STORAGE_KEY.sessionId),
        query: `SELECT * FROM Leads WHERE mobile = ${callNum} OR phone = ${callNum} OR fax = ${callNum};`,
    };
    const host = sessionStorage.getItem('host');
    return request(`${host}/webservice.php?${stringify(params)}`)
}

export function putCallInfo(params) {
    const host = sessionStorage.getItem('host');
    return request(`${host}/webservice.php`, {
        method: 'POST',
        body: stringify(params),
    })
}

export function createContact(params) {
    const host = sessionStorage.getItem('host');
    return request(`${host}/webservice.php`, {
        method: 'POST',
        body: stringify(params),
    })
}