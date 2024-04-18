import { createContact, getContact, putCallInfo, getLead } from '@/services/home';
import { MODULES } from '@/constant';
import { get } from 'lodash';

export default {
    namespace: 'home',
    state: {},

    effects: {
        *getContact({ payload }, { call, put }) {
            const { callNum } = payload;
            let module = MODULES.contact;
            let res = yield call(getContact, callNum);
            let connectState = res?.code || 'SUCCESS';
            yield put({
                type: 'global/save',
                payload: {
                    connectState,
                },
            });
            if (!res?.result?.length || res?.result?.length === 0) {
                module = MODULES.lead;
                res = yield call(getLead, callNum);
            }

            const contactInfo = get(res, ['result', 0]) || {};
            return {
                displayNotification: connectState === 'SUCCESS',
                ...contactInfo,
                module,
            };
        },

        *putCallInfo({ payload }, { call, put }) {
            const res = yield call(putCallInfo, payload);
            yield put({
                type: 'global/save',
                payload: {
                    connectState: res?.code || 'SUCCESS',
                },
            });
            return res;
        },

        *createContact({ payload }, { call, put }) {
            const res = yield call(createContact, payload);
            yield put({
                type: 'global/save',
                payload: {
                    connectState: res?.code || 'SUCCESS',
                },
            });
            return get(res, ['result']) || {};
        },
    },

    reducers: {
        save(state, action) {
            return { ...state, ...action.payload };
        },
    },
};
