import { combineReducers } from '@reduxjs/toolkit';

import appSlice from './app/appSlice';
import authSlice from './auth/authSlice';
import errorSlice from './error/errorSlice';
import languageSlice from './language/languageSlice';

const rootReducer = combineReducers({
    app: appSlice,
    auth: authSlice,
    error: errorSlice,
    language: languageSlice
});

export default rootReducer;