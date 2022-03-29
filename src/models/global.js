import { get } from 'lodash';
import { getUser } from '@/services/global';

export default {
    namespace: 'global', state: {
        userConfig: {}, connectState: 'SUCCESS', user: {},
    },

    effects: {
        * getUser({ payload }, { call, put }) {
            const res = yield call(getUser, payload);
            const user = get(res, 'result') || {};
            yield put({
                type: 'global/save', payload: {
                    user, connectState: res?.code || 'SUCCESS',
                }
            })
            return res;
        },

        * saveUserConfig({ payload }, { put }) {
            console.log(payload);
            pluginSDK.userConfig.addUserConfig({ userConfig: JSON.stringify(payload) }, function ({ errorCode }) {
                console.log(errorCode);
            })
            yield put({
                type: 'save', payload: {
                    userConfig: payload
                },
            })
        }
    },

    reducers: {
        save(state, action) {
            return { ...state, ...action.payload };
        },
    },
};
