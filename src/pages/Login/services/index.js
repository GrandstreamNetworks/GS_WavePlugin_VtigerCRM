import { stringify } from 'qs';
import request from '../../../utils/request';

/**
 * getChallenge
 * @returns
 */
export function getChallenge(params) {
    const host = sessionStorage.getItem('host');
    return request(`${host}/webservice.php?${stringify(params)}`);
}

/**
 * login
 * @returns
 */
export function login(params) {
    const host = sessionStorage.getItem('host');
    return request(`${host}/webservice.php`, {
        method: 'POST',
        body: stringify(params),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        }
    });
}
