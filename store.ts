import { configureStore } from '@reduxjs/toolkit';

import rootReducer from './reducers/rootReducer';

const store = configureStore({
    reducer: rootReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type RootDispatch = typeof store.dispatch;

export default store;