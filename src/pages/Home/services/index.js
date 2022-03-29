import { stringify } from 'qs';
import request from '../../../utils/request';

export function getContact(params) {
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