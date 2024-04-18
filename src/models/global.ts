import { getUser } from '@/services/global'
import { get } from 'lodash'
import { Effect, Reducer, history } from 'umi'

export interface GlobalModelState {
    user: LooseObject
    userConfig: LooseObject
    connectState: string
}

export interface GlobalModelType {
    namespace: string
    state: GlobalModelState
    effects: {
        getUser: Effect
        userConfigChange: Effect
        saveUserConfig: Effect
        logout: Effect
    }
    reducers: {
        save: Reducer<GlobalModelState>
    }
}

const GlobalModel: GlobalModelType = {
    namespace: 'global', state: {
        userConfig: {},
        connectState: 'SUCCESS',
        user: {},
    },

    effects: {
        * getUser({ payload }, { call, put }): any {
            const res = yield call(getUser, payload)
            const user = get(res, 'result') || {}
            if (user.id) {
                yield put({
                    type: 'global/save', payload: {
                        user, connectState: res?.code || 'SUCCESS',
                    }
                })
                return res
            }
            yield put({
                type: 'global/save', payload: {
                    connectState: res?.code || 'SUCCESS',
                }
            })
            return res
        },

        * userConfigChange({ payload }, { put, select }) {
            const { userConfig } = yield select((state: any) => state.global);
            const newConfig = {
                ...userConfig,
                ...payload,
            }
            yield put({
                type: 'saveUserConfig',
                payload: newConfig,
            })
        },

        * saveUserConfig({ payload }, { put }) {
            console.log(payload)
            // @ts-ignore
            pluginSDK.userConfig.addUserConfig({ userConfig: JSON.stringify(payload) }, function ({ errorCode }) {
                console.log(errorCode)
            })
            yield put({
                type: 'save', payload: {
                    userConfig: payload
                },
            })
        },

        * logout(_, { put, select }) {
            const { userConfig } = yield select((state: any) => state.global)
            userConfig.autoLogin = false
            userConfig.accessKey = undefined
            yield put({
                type: 'saveUserConfig', payload: userConfig,
            })
            history.replace({ pathname: '/login' })
        }

    },

    reducers: {
        save(state, action) {
            return { ...state, ...action.payload }
        },
    },
}

export default GlobalModel;