import { Footer } from '@/components'
import { AUTO_CREATE_CONFIG_DEF, LOGIN_KEYS, NOTIFICATION_CONFIG_DEF, OPERATION_TYPE, SESSION_STORAGE_KEY, UPLOAD_CALL_CONFIG_DEF } from '@/constant'
import { checkServerAddress } from '@/utils/utils'
import { Button, Checkbox, Form, Image, Input } from 'antd'
import md5 from 'js-md5'
import { get } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import { Dispatch, Loading, connect, history, useIntl } from 'umi'
import AccountIcon from '../../asset/login/account-line.svg'
import CodeIcon from '../../asset/login/code-line.svg'
import CloseIcon from '../../asset/login/password-close.svg'
import OpenIcon from '../../asset/login/password-open.svg'
import HostIcon from '../../asset/login/service-line.svg'
import styles from './index.less'

interface Props {
    getChallenge: (params: LooseObject) => Promise<LooseObject>
    login: (params: LooseObject) => Promise<LooseObject>
    getUser: (params: LooseObject) => Promise<LooseObject>
    saveUserConfig: (params: LooseObject) => void
    loading: boolean | undefined
}

const LoginPage: React.FC<Props> = ({ getChallenge, login, getUser, saveUserConfig, loading = false }) => {
    const [errorMessage, setErrorMessage] = useState('')
    const [remember, setRemember] = useState(true)
    const config = useRef({})

    const [form] = Form.useForm()
    const { formatMessage } = useIntl()

    const onfocus = () => {
        setErrorMessage('')
    }

    /**
     * 自动登录状态更改
     * @param e
     */
    const onCheckChange = (e: any) => {
        setRemember(e.target.checked)
    }

    /**
     * 登录成功，页面跳转
     * 默认跳转home页
     */
    const loginSuccess = () => {
        history.replace({
            pathname: '/home'
        })
    }

    /**
     * 获取当前用户信息
     * @param sessionName token
     * @param id 当前用户id
     */
    const getUserInfo = (sessionName: string, id: string, values: LooseObject) => {
        const params = {
            operation: OPERATION_TYPE.RETRIEVE, sessionName, id,
        }
        getUser(params).then(res => {
            const userConfig = {
                ...values,
                accessKey: remember ? values.accessKey : '',
                autoLogin: remember,
                uploadCall: values.uploadCall ?? true,
                notification: values.notification ?? true,
                autoCreate: values.autoCreate ?? false,
                autoCreateConfig: values.autoCreateConfig ?? AUTO_CREATE_CONFIG_DEF,
                uploadCallConfig: values.uploadCallConfig ?? UPLOAD_CALL_CONFIG_DEF,
                notificationConfig: values.notificationConfig ?? NOTIFICATION_CONFIG_DEF,
            }
            saveUserConfig(userConfig)
            res?.success && loginSuccess()
        })
    }

    const onFinish = (values: LooseObject) => {
        let host = values.host
        host = checkServerAddress(host);
        sessionStorage.setItem(SESSION_STORAGE_KEY.host, host)
        const params = {
            username: values.username, operation: OPERATION_TYPE.GET_CHALLENGE,
        }
        getChallenge(params).then(res => {
            if (!res?.success) {
                setErrorMessage(res?.error?.message)
                return
            }
            const params = {
                operation: OPERATION_TYPE.LOGIN,
                username: values.username,
                accessKey: md5(get(res, ['result', 'token']) + values.accessKey)
            }
            login(params).then(res => {
                if (!res?.success) {
                    setErrorMessage(res?.error?.message)
                    return
                }
                const sessionName = get(res, ['result', 'sessionName'])
                const id = get(res, ['result', 'userId'])
                sessionStorage.setItem(SESSION_STORAGE_KEY.sessionId, sessionName)
                getUserInfo(sessionName, id, {
                    ...config.current,
                    ...values,
                    host,
                })
            })
        })
    }

    /**
     * 获取用户信息
     * 填充表单
     * 调用登录方法-onFinish()
     */
    useEffect(() => {
        // @ts-ignore
        pluginSDK.userConfig.getUserConfig(function ({ errorCode, data }) {
            if (errorCode === 0 && data) {
                const userConfig = JSON.parse(data)
                console.log(userConfig)
                form.setFieldsValue(userConfig)
                config.current = userConfig;

                // 已登录的与预装配置进行对比
                let sameConfig = true;

                // 有预装配置 走预装配置
                const preParamObjectStr = sessionStorage.getItem('preParamObject');
                if (preParamObjectStr) {
                    const preParamObject = JSON.parse(sessionStorage.getItem('preParamObject') || '');
                    if (preParamObject) {
                        const formParams: LooseObject = {};
                        Object.keys(preParamObject).forEach((item) => {
                            LOGIN_KEYS.forEach((element) => {
                                if (item.toLowerCase() === element.toLowerCase()) {
                                    formParams[element] = preParamObject[item];
                                    if (!sameConfig) {
                                        return;
                                    }
                                    sameConfig = preParamObject[item] === userConfig[element];
                                }
                            });
                        });
                        form.setFieldsValue({ ...formParams });
                    }
                }
                if (userConfig.autoLogin && sameConfig) {
                    onFinish(userConfig)
                }
            }
            else {
                // 有预装配置 走预装配置
                const preParamObjectStr = sessionStorage.getItem('preParamObject');
                if (!preParamObjectStr) {
                    return;
                }
                const preParamObject = JSON.parse(preParamObjectStr);
                const userInfo: LooseObject = { username: '', accessKey: '', host: '' }
                if (preParamObject) {
                    Object.keys(preParamObject).forEach(item => {
                        Object.keys(userInfo).forEach(element => {
                            if (item.toLowerCase() === element.toLowerCase()) {
                                userInfo[element] = preParamObject[item]
                            }
                        })
                    })
                    form.setFieldsValue({ ...userInfo })
                }
                onFinish(userInfo)
            }
        })
    }, [])

    return (<>
        {errorMessage && <div className={styles.errorDiv}>
            <div className={styles.errorMessage}>{formatMessage({ id: errorMessage })}</div>
        </div>}
        <div className={styles.homePage}>
            <div className={styles.form}>
                <Form layout="vertical" form={form} onFinish={onFinish} onFocus={onfocus}>
                    <div className={styles.formContent}>
                        <Form.Item
                            name="host"
                            rules={[{
                                required: true, message: formatMessage({ id: 'login.host.error' })
                            }]}
                        >
                            <Input placeholder={formatMessage({ id: 'login.host' })}
                                prefix={<Image src={HostIcon} preview={false} />} />
                        </Form.Item>
                        <Form.Item
                            name="username"
                            rules={[{
                                required: true, message: formatMessage({ id: 'login.username.error' })
                            }]}>
                            <Input placeholder={formatMessage({ id: 'login.username' })}
                                prefix={<Image src={AccountIcon} preview={false} />}
                            />
                        </Form.Item>
                        <Form.Item
                            name="accessKey"
                            rules={[{
                                required: true, message: formatMessage({ id: 'login.accessKey.error' })
                            }]}>
                            <Input.Password placeholder={formatMessage({ id: 'login.accessKey' })}
                                prefix={<Image src={CodeIcon} preview={false} />}
                                iconRender={visible => (visible ? <Image src={OpenIcon}
                                    preview={false} /> : <Image
                                    src={CloseIcon} preview={false} />)}
                            />
                        </Form.Item>
                    </div>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                        >
                            {formatMessage({ id: 'login.submit' })}
                        </Button>
                    </Form.Item>
                    <div className={styles.remember}>
                        <Checkbox checked={remember} onChange={onCheckChange}>
                            {formatMessage({ id: 'login.remember' })}
                        </Checkbox>
                    </div>
                </Form>
            </div>
        </div>
        <Footer url="https://documentation.grandstream.com/knowledge-base/wave-crm-add-ins/#overview"
            message={formatMessage({ id: 'login.user.guide' })} />
    </>)
}

export default connect(({ loading }: { loading: Loading }) => ({
    loading: loading.effects['login/getChallenge'] || loading.effects['login/login'] || loading.effects['global/getUser']
}), (dispatch: Dispatch) => ({
    getChallenge: (payload: LooseObject) => dispatch({
        type: 'login/getChallenge', payload,
    }),
    login: (payload: LooseObject) => dispatch({
        type: 'login/login', payload,
    }),
    getUser: (payload: LooseObject) => dispatch({
        type: 'global/getUser', payload,
    }),
    saveUserConfig: (payload: LooseObject) => dispatch({
        type: 'global/saveUserConfig', payload,
    })
}))(LoginPage)
