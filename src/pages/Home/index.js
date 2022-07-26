import React, { useCallback } from 'react'
import { connect, useIntl } from 'umi'
import moment from 'moment-timezone'
import { CallAction, ConfigBlock, ConnectError, ConnectState, Footer } from '@/components'
import { CRM_URL, DATE_FORMAT, OPERATION_TYPE, SESSION_STORAGE_KEY } from '@/constant'
import { getNotificationBody, getValueByConfig } from '@/utils/utils'
import styles from './index.less'

const HomePage = ({ uploadCall, user, showConfig, getContact, putCallInfo, callState }) => {
    const { formatMessage } = useIntl()

    const host = sessionStorage.getItem(SESSION_STORAGE_KEY.host)

    const getContactByCallNum = callNum => {
        callNum = callNum.replace(/\b(0+)/gi, '')
        const params = {
            operation: OPERATION_TYPE.QUERY,
            sessionName: sessionStorage.getItem(SESSION_STORAGE_KEY.sessionId),
            query: `SELECT * FROM Contacts WHERE mobile = ${callNum} OR phone = ${callNum} OR homephone = ${callNum} OR otherphone = ${callNum};`,
        }
        return getContact(params)
    }

    const uploadCallInfo = useCallback((callNum, callStartTimeStamp, callEndTimeStamp) => {
        if (!uploadCall) {
            return
        }
        getContactByCallNum(callNum).then(contactInfo => {
            if (!contactInfo?.id) {
                return
            }
            const duration = callEndTimeStamp - callStartTimeStamp
            const jsonData = {
                subject: `${contactInfo.firstname ?? ''} ${contactInfo.lastname ?? ''}'s call`,
                assigned_user_id: user.id,
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
    }, [uploadCall, user])

    /**
     * 获取vTigerCRM系统URL
     * 如果查询到联系人，返回联系人详情页
     * 返回到新建联系人界面
     */
    const getUrl = contact => {
        if (contact?.id) {
            // id: 12x6 去掉12x 取 6
            const contactId = contact.id.split('x')[1]
            return host + CRM_URL.DETAIL_URL + contactId
        }
        return host + CRM_URL.EDIT_URL
    }

    /**
     * 调用接口根据号码查询联系人信息
     * 调用wave接口，打开通知窗口，展示信息
     * @param callNum 号码
     */
    const initCallInfo = useCallback(callNum => {
        getContactByCallNum(callNum).then(contact => {
            console.log("callState", callState);
            if (!contact?.displayNotification || !callState.get(callNum)) {
                return;
            }
            const url = getUrl(contact)
            const pluginPath = sessionStorage.getItem('pluginPath')
            // body对象，
            const body = {
                logo: `<div style="margin-bottom: 12px"><img src="${pluginPath}/vtiger.svg" alt=""/> Vtiger CRM</div>`,
            }

            // 根据自定义信息，添加body属性
            if (contact?.id) {
                // 将showConfig重复的删除
                const configList = [...new Set(Object.values(showConfig))]
                console.log(configList);
                for (const key in configList) {
                    console.log(configList[key])
                    if (!configList[key]) {
                        continue;
                    }

                    // 取出联系人的信息用于展示
                    const configValue = getValueByConfig(contact, configList[key]);
                    console.log(configValue);
                    if (configList[key] === 'Phone') {
                        body[`config_${key}`] = `<div style="font-weight: bold">${callNum}</div>`
                    }
                    else if (configValue) {
                        body[`config_${key}`] = `<div style="font-weight: bold; display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 5;overflow: hidden;word-break: break-all;text-overflow: ellipsis;">${configValue}</div>`
                    }
                }
            }
            else {
                body.phone = `<div style="font-weight: bold;">${callNum}</div>`
            }
            body.action = `<div style="margin-top: 10px;display: flex;justify-content: flex-end;"><button style="background: none; border: none;">
                     <a href=${url} target="_blank" style="color: #62B0FF">
                         ${contact?.id ? formatMessage({ id: 'home.detail' }) : formatMessage({ id: 'home.edit' })}
                     </a>
                 </button></div>`;

            console.log('displayNotification')
            pluginSDK.displayNotification({
                notificationBody: getNotificationBody(body),
            })
        })
    }, [showConfig, callState])

    return (<>
        <CallAction initCallInfo={initCallInfo} uploadCallInfo={uploadCallInfo} />
        <ConnectError />
        <div className={styles.homePage}>
            <ConnectState />
            <ConfigBlock />
        </div>
        <Footer url={host + CRM_URL.HOME} message={formatMessage({ id: 'home.toCRM' })} />
    </>)
}

export default connect(
    ({ global }) => ({
        uploadCall: global.uploadCall,
        user: global.user,
        showConfig: global.showConfig,
        callState: global.callState,
    }),
    (dispatch) => ({
        getContact: payload => dispatch({
            type: 'home/getContact', payload,
        }),
        putCallInfo: payload => dispatch({
            type: 'home/putCallInfo', payload
        })
    })
)(HomePage)