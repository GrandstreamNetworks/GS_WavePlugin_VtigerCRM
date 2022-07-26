import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Form, Image, Input } from 'antd'
import { connect, history, useIntl } from 'umi'
import { get } from 'lodash'
import md5 from 'js-md5'
import { Footer } from '@/components'
import { OPERATION_TYPE, SESSION_STORAGE_KEY } from '@/constant'
import HostIcon from '../../asset/login/service-line.svg'
import AccountIcon from '../../asset/login/account-line.svg'
import CodeIcon from '../../asset/login/code-line.svg'
import OpenIcon from '../../asset/login/password-open.svg'
import CloseIcon from '../../asset/login/password-close.svg'
import styles from './index.less'

const LoginPage = ({ getChallenge, login, getUser, saveUserConfig, save, loading = false }) => {
    const [errorMessage, setErrorMessage] = useState('')
    const [remember, setRemember] = useState(true)

    const [form] = Form.useForm()
    const { formatMessage } = useIntl()

    const onfocus = () => {
        setErrorMessage('')
    }

    /**
     * 自动登录状态更改
     * @param e
     */
    const onCheckChange = e => {
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
    const getUserInfo = (sessionName, id) => {
        const params = {
            operation: OPERATION_TYPE.RETRIEVE, sessionName, id,
        }
        getUser(params).then(res => {
            res?.success && loginSuccess()
        })
    }

    const onFinish = values => {
        sessionStorage.setItem(SESSION_STORAGE_KEY.host, values.host)
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
                const userConfig = {
                    ...values,
                    accessKey: remember ? values.accessKey : '',
                    autoLogin: remember,
                    uploadCall: values.uploadCall ?? true,
                    showConfig: values.showConfig ?? {
                        first: 'Name', second: 'Phone', third: 'None', forth: 'None', fifth: 'None',
                    },
                }
                saveUserConfig(userConfig)
                save({
                    uploadCall: values.uploadCall ?? true, showConfig: values.showConfig ?? {
                        first: 'Name', second: 'Phone', third: 'None', forth: 'None', fifth: 'None',
                    },
                })
                getUserInfo(sessionName, id)
            })
        })
    }

    /**
     * 获取用户信息
     * 填充表单
     * 调用登录方法-onFinish()
     */
    useEffect(() => {
        pluginSDK.userConfig.getUserConfig(function ({ errorCode, data }) {
            if (errorCode === 0 && data) {
                const userConfig = JSON.parse(data)
                console.log(userConfig)
                form.setFieldsValue(userConfig)
                if (userConfig.autoLogin) {
                    onFinish(userConfig)
                }
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

export default connect(({ loading }) => ({
    loading: loading.effects['login/getChallenge'] || loading.effects['login/login'] || loading.effects['global/getUser']
}), (dispatch) => ({
    getChallenge: payload => dispatch({
        type: 'login/getChallenge', payload,
    }), login: payload => dispatch({
        type: 'login/login', payload,
    }), getUser: payload => dispatch({
        type: 'global/getUser', payload,
    }), saveUserConfig: payload => dispatch({
        type: 'global/saveUserConfig', payload,
    }), save: payload => dispatch({
        type: 'global/save', payload
    })
}))(LoginPage)
