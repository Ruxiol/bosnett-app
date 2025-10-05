import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

import enMessages from '../../constants/translations/enMessages';
import bsMessages from '../../constants/translations/bsMessages';

const initialState = {
    language: 'en',
    messages: enMessages,
};

export const loadLanguage = createAsyncThunk('language/loadLanguage', async () => {
    const savedLanguage = await AsyncStorage.getItem('selectedLanguage');
    return savedLanguage || 'en';
});

const languageSlice = createSlice({
    name: 'language',
    initialState,
    reducers: {
        setLanguage: (state, action) => {
            const selectedLanguage = action.payload;
            state.language = selectedLanguage;
            state.messages = selectedLanguage === 'bs' ? bsMessages : enMessages;
            AsyncStorage.setItem('selectedLanguage', selectedLanguage);
        }
    },
    extraReducers: (builder) => {
        builder.addCase(loadLanguage.fulfilled, (state, action) => {
            const loadedLanguage = action.payload;
            state.language = loadedLanguage;
            state.messages = loadedLanguage === 'bs' ? bsMessages : enMessages;
        });
    }
});

export const { setLanguage } = languageSlice.actions;

export default languageSlice.reducer;
