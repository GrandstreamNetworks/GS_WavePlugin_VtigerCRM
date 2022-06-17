import React, { useEffect, useRef } from 'react';
import { connect, history, useIntl } from 'umi';
import { Button, Col, Row } from 'antd'
import moment from 'moment-timezone';
import { ConnectError, ConnectState, Footer, SwitchBtn } from '@/components';
import { CRM_URL, DATE_FORMAT, EVENT_KEY, OPERATION_TYPE, SESSION_STORAGE_KEY } from '@/constant';
import { getNotificationBody } from '@/utils/utils';
import styles from './index.less'


const HomePage = ({ userConfig, userInfo, saveUserConfig, getContact, putCallInfo }) => {
    const { formatMessage } = useIntl();

    const host = sessionStorage.getItem(SESSION_STORAGE_KEY.host);

    const callNumber = useRef(null);

    /**
     * 登出
     */
    const logoutClick = () => {
        const config = JSON.parse(JSON.stringify(userConfig));
        config.autoLogin = false;
        config.accessKey = undefined;
        saveUserConfig(config);
        history.replace({ pathname: '/login' });
    };

    const getContactByCallNum = callNum => {
        callNum = callNum.replace(/\b(0+)/gi, '');
        const params = {
            operation: OPERATION_TYPE.QUERY,
            sessionName: sessionStorage.getItem(SESSION_STORAGE_KEY.sessionId),
            query: `SELECT * FROM Contacts WHERE mobile = ${callNum} OR phone = ${callNum} OR homephone = ${callNum} OR otherphone = ${callNum};`,
        }
        return getContact(params);
    }

    const uploadCallInfo = (callNum, callStartTimeStamp, callEndTimeStamp) => {
        if (!userConfig.uploadCall) {
            return;
        }
        getContactByCallNum(callNum).then(contactInfo => {
            if (!contactInfo?.id) {
                return;
            }
            const duration = callEndTimeStamp - callStartTimeStamp;
            const jsonData = {
                subject: `${contactInfo.firstname + contactInfo.lastname}'s call`,
                assigned_user_id: userInfo.id,
                date_start: `${moment(callStartTimeStamp || undefined).format(DATE_FORMAT.format_3)}`,
                time_start: `${moment(callStartTimeStamp || undefined).format(DATE_FORMAT.format_5)}`,
                due_date: `${moment(callEndTimeStamp || undefined).format(DATE_FORMAT.format_3)}`,
                time_end: `${moment(callEndTimeStamp || undefined).format(DATE_FORMAT.format_5)}`,
                eventstatus: 'Not Held',
                activitytype: 'Call',
                duration_hours: `${moment.duration(duration).hours()}`,
                duration_minutes: `${moment.duration(duration).minutes()}`,
                contact_id: `${contactInfo.id}`,
                visibility: 'Public'
            }

            const params = {
                operation: OPERATION_TYPE.CREATE,
                sessionName: sessionStorage.getItem(SESSION_STORAGE_KEY.sessionId),
                elementType: OPERATION_TYPE.EVENT,
                element: JSON.stringify(jsonData)
            }
            putCallInfo(params).then(res => {
                console.log(res)
            })
        })
    }

    /**
     * 获取vTigerCRM系统URL
     * 如果查询到联系人，返回联系人详情页
     * 返回到新建联系人界面
     */
    const getUrl = contact => {
        if (contact?.id) {
            // id: 12x6 去掉12x 取 6
            const contactId = contact.id.split('x')[1];
            return host + CRM_URL.DETAIL_URL + contactId;
        }
        return host + CRM_URL.EDIT_URL
    }

    /**
     * 调用接口根据号码查询联系人信息
     * 调用wave接口，打开通知窗口，展示信息
     * @param callNum 号码
     */
    const initCallInfo = callNum => {
        getContactByCallNum(callNum).then(contact => {
            if (!contact?.displayNotification) {
                return;
            }
            const url = getUrl(contact);
            const pluginPath = sessionStorage.getItem('pluginPath');
            const name = contact.firstname + contact.lastname;
            const department = contact?.department;
            const title = contact?.title;
            const job = department && title ? department + '|' + title : department || title;
            const body = {
                logo: `<div style="margin-bottom: 12px"><img src="${pluginPath}/vtiger.svg" alt=""/> Vtiger CRM</div>`,
                info: name ? `<div style="font-weight: bold; text-overflow: ellipsis; white-space:nowrap; overflow: hidden">${name}</div>` : null,
                PhoneNumber: `<div style="font-weight: bold; text-overflow: ellipsis; white-space:nowrap; overflow: hidden">${callNum}</div>`,
                title: job ? `<div style="font-weight: bold; text-overflow: ellipsis; white-space:nowrap; overflow: hidden">${job}</div>` : null,
                action: `<div style="margin-top: 10px;display: flex;justify-content: flex-end;"><button style="background: none; border: none;">
                             <a href=${url} target="_blank" style="color: #62B0FF">
                                 ${contact?.id ? formatMessage({ id: 'home.detail' }) : formatMessage({ id: 'home.edit' })}
                             </a>
                         </button></div>`
            }

            console.log('displayNotification');
            pluginSDK.displayNotification({
                notificationBody: getNotificationBody(body),
            })
        })
    }

    useEffect(() => {
        /**
         * 监听收到语音/视频来电
         * 回调函数参数：callType,callNum
         */
        pluginSDK.eventEmitter.on(EVENT_KEY.recvP2PIncomingCall, function ({ callType, callNum }) {
            console.log('onRecvP2PIncomingCall', callType, callNum);
            callNumber.current = callNum;
            initCallInfo(callNum);
        })

        /**
         * 监听wave发起语音/视频
         * 回调函数参数：callType,callNum
         */
        pluginSDK.eventEmitter.on(EVENT_KEY.initP2PCall, function ({ callType, callNum }) {
            console.log('onHangupP2PCall', callType, callNum);
            callNumber.current = callNum;
            initCallInfo(callNum);
        })


        return function cleanup() {
            pluginSDK.eventEmitter.off(EVENT_KEY.recvP2PIncomingCall);

            pluginSDK.eventEmitter.off(EVENT_KEY.initP2PCall);
        }
    }, [])

    useEffect(() => {
        /**
         * 监听拒绝语音/视频
         * 回调函数参数：callType,callNum
         */
        pluginSDK.eventEmitter.on(EVENT_KEY.rejectP2PCall, function ({ callType, callNum }) {
            console.log('onRejectP2PCall', callType, callNum);
            uploadCallInfo(callNum, 0, 0);
            if (callNumber.current === callNum) {
                setTimeout(() => {
                    // @ts-ignore
                    pluginSDK.hideNotification();
                }, 1000)
            }
        })

        /**
         * 监听挂断语音/视频
         * 回调函数参数：callType,callNum
         */
        pluginSDK.eventEmitter.on(EVENT_KEY.hangupP2PCall, function (data) {
            console.log('onHangupP2PCall', data);
            let { callNum, callStartTimeStamp, callEndTimeStamp } = data
            uploadCallInfo(callNum, callStartTimeStamp ?? 0, callEndTimeStamp ?? 0);
            if (callNumber.current === callNum) {
                setTimeout(() => {
                    // @ts-ignore
                    pluginSDK.hideNotification();
                }, 1000)
            }
        })

        pluginSDK.eventEmitter.on(EVENT_KEY.p2PCallCanceled, function ({ callNum }) {
            uploadCallInfo(callNum, 0, 0);
            if (callNumber.current === callNum) {
                setTimeout(() => {
                    // @ts-ignore
                    pluginSDK.hideNotification();
                }, 1000)
            }
        })

        return function cleanup() {
            pluginSDK.eventEmitter.off(EVENT_KEY.hangupP2PCall);

            pluginSDK.eventEmitter.off(EVENT_KEY.p2PCallCanceled);

            pluginSDK.eventEmitter.off(EVENT_KEY.rejectP2PCall);
        }

    }, [userConfig])

    return (<>
        <ConnectError />
        <div className={styles.homePage}>
            <ConnectState />
            <div className={styles.callConfig}>
                <Row>
                    <Col span={19}>
                        <span className={styles.spanLabel}>{formatMessage({ id: 'home.Synchronize' })}</span>
                    </Col>
                    <Col span={4}>
                        <SwitchBtn />
                    </Col>
                </Row>
            </div>
            <Button onClick={logoutClick}>{formatMessage({ id: 'home.logout' })}</Button>
        </div>
        <Footer url={host + CRM_URL.HOME} message={formatMessage({ id: 'home.toCRM' })} />
    </>)
}

export default connect(({ global }) => ({
    userConfig: global.userConfig, user: global.user,
}), (dispatch) => ({
    getContact: payload => dispatch({
        type: 'home/getContact', payload,
    }), putCallInfo: payload => dispatch({
        type: 'home/putCallInfo', payload
    }), saveUserConfig: payload => dispatch({
        type: 'global/saveUserConfig', payload,
    })
}))(HomePage);