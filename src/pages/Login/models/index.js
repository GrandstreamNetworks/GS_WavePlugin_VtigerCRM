import { getChallenge, login } from '../services';

export default {
    namespace: 'login', state: {},
    
    effects: {
        * getChallenge({payload}, {call, put}) {
            const res = yield call(getChallenge, payload);
            yield put({
                type: 'global/save', payload: {
                    connectState: res?.code|| 'SUCCESS',
                }
            })
            return res;
        },
        
        * login({payload}, {call, put}) {
            const res = yield call(login, payload);
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
            return {...state, ...action.payload};
        },
    },
};
