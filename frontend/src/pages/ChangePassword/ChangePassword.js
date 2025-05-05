import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as authService from '~/services/authService';
import classNames from 'classnames/bind';
import styles from './ChangePassword.module.scss';

const cx = classNames.bind(styles);
function ChangePassword() {
    return <div> ChangePassword Page</div>;
}

export default ChangePassword;
