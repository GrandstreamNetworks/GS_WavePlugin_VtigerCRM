import { stringify } from 'qs';
import request from '../utils/request';

/**
 * 获取联系人列表
 * @param params
 * @returns
 */
export function getUser(params) {
    const host = sessionStorage.getItem('host');
    return request(`${host}/webservice.php?${stringify(params)}`);
}
