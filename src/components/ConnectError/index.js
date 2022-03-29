import React from 'react';
import { Button } from 'antd';
import { connect, useIntl } from 'umi';
import { get } from 'lodash'
import { ExclamationCircleFilled, LoadingOutlined } from '@ant-design/icons';
import { REQUEST_CODE, SESSION_STORAGE_KEY, OPERATION_TYPE } from '@/constant';
import styles from './index.less'

const IndexPage = ({ connectState, user, save, getUser }) => {
    const { formatMessage } = useIntl();

    const reConnect = () => {
        save({ connectState: REQUEST_CODE.reConnect });
        const sessionName = sessionStorage.getItem(SESSION_STORAGE_KEY.sessionId);
        getUser({ operation: OPERATION_TYPE.RETRIEVE, sessionName, id: user.id });
    }

    return (
        <div className={styles.errorPage}>
            <div className={styles.connectException} hidden={connectState !== REQUEST_CODE.connectError}>
                <ExclamationCircleFilled style={{ fontSize: '15px', color: '#F54E4E' }} />
                <span className={styles.connectSpan}>{formatMessage({ id: 'home.connection.exception' })}</span>
                <Button className={styles.connectButton}
                    onClick={reConnect}>{formatMessage({ id: 'home.reConnect.btn' })}</Button>
            </div>
            <div className={styles.reConnect} hidden={connectState !== REQUEST_CODE.reConnect}>
                <LoadingOutlined />
                <span className={styles.connectSpan}>{formatMessage({ id: 'home.reConnect' })}</span>
            </div>
        </div>
    )
}

export default connect(
    ({ global }) => ({
        user: global.user,
        connectState: global.connectState,
    }),
    (dispatch) => ({
        getUser: payload => dispatch({
            type: 'global/getUser', payload,
        }),
        save: (payload) => dispatch({
            type: 'global/save',
            payload,
        })
    })
)(IndexPage);