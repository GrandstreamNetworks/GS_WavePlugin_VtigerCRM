import { get } from 'lodash';
import { getContact, putCallInfo } from '../services';

export default {
    namespace: 'home', state: {},
    
    effects: {
        * getContact({ payload }, { call, put }) {
            const res = yield call(getContact, payload);
            
            let connectState = res?.code || 'SUCCESS';
            yield put({
                type: 'global/save', payload: {
                    connectState,
                }
            })
            const contactInfo = get(res, ['result', 0]) || {}
            return {
                displayNotification: connectState === 'SUCCESS', ...contactInfo,
            };
        },
        
        * putCallInfo({ payload }, { call, put }) {
            const res = yield call(putCallInfo, payload);
            yield put({
                type: 'global/save', payload: {
                    connectState: res?.code || 'SUCCESS',
                }
            })
            return res;
        }
    },
    
    reducers: {
        save(state, action) {
            return { ...state, ...action.payload }
        }
    }
}