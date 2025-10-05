import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import AuthStateInterface from './interfaces/authStateInterface';
import IProfileData from '../../interfaces/IProfileData';

const initialState: AuthStateInterface = {
    isAuthenticated: false,
    isLoading: false,
    userData: {
        email: '',
        userId: '',
        firstName: '',
        lastName: '',
        userName: '',
        profileImage: '',
        dayOfBirth: '',
        bio: '',
        socialMedia: [],
        education: [],
        workExperience: [],
        friendRequestsReceived: [],
        friends: [],
        friendRequestsSent: [],
        notificationToken: ''
    }
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state) {
            state.isAuthenticated = true
        },
        logout(state) {
            state.isAuthenticated = false
        },
        setIsLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload
        },
        setUserData(state, action: PayloadAction<IProfileData>) {
            state.userData = action.payload
        }
    },
});

export const {
    login,
    logout,
    setIsLoading,
    setUserData
} = authSlice.actions;

export default authSlice.reducer;
