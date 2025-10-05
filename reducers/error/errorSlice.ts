import ErrorStateInterface from "./interfaces/errorStateInterface";

const initialState: ErrorStateInterface = {
    message: ''
}

import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const errorSlice = createSlice({
    name: 'error',
    initialState,
    reducers: {
        setError: (state, action: PayloadAction<string>) => {
            state.message = action.payload;
        },
        clearError: (state) => {
            state.message = '';
        },
    },
});

export const { setError, clearError } = errorSlice.actions;

export default errorSlice.reducer;