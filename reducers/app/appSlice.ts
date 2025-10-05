import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import AppStateInterface from './interfaces/appStateInterface';
import ImageFullScreenModalPayload from './interfaces/imageFullScreenModalInterface/imageFullScreenModalPayload';
import newsFeedItemPayload from './interfaces/newsFeedItemPayload';

const initialState: AppStateInterface = {
    isLoading: false,
    createPostModal: {
        isVisible: false
    },
    imageFullScreeenModal: {
        isVisible: false,
        imageUris: [],
        startIndex: 0
    },
    commentModal: {
        isVisible: false
    },
    successModal: {
        isVisible: false
    },
    footerActiveButton: {
        activeTab: 'Home'
    },
    newsFeedActiveItem: {
        postId: '',
        commentsCount: 0
    },
    searchText: '',
    refetchPosts: false,
};

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setIsLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload
        },
        setCreatePostModal(state, action: PayloadAction<boolean>) {
            state.createPostModal.isVisible = action.payload
        },
        setImageFullScreenModal(state, action: PayloadAction<ImageFullScreenModalPayload>) {
            const { isVisible, uris, startIndex } = action.payload
            state.imageFullScreeenModal.isVisible = isVisible,
                state.imageFullScreeenModal.imageUris = uris,
                state.imageFullScreeenModal.startIndex = startIndex
        },
        setCommentModal(state, action: PayloadAction<boolean>) {
            state.commentModal.isVisible = action.payload
        },
        setSuccessModal(state, action: PayloadAction<boolean>) {
            state.successModal.isVisible = action.payload
        },
        setActiveTab(state, action: PayloadAction<string>) {
            state.footerActiveButton.activeTab = action.payload
        },
        resetActiveTab: (state) => {
            state.footerActiveButton.activeTab = 'Home';
        },
        setActiveFeedItem(state, action: PayloadAction<newsFeedItemPayload>) {
            state.newsFeedActiveItem.postId = action.payload.postId,
                state.newsFeedActiveItem.commentsCount = action.payload.commentsCount
        },
        setSearchText(state, action: PayloadAction<string>) {
            state.searchText = action.payload
        },
        refetchPosts(state, action: PayloadAction<boolean>) {
            state.refetchPosts = action.payload
        }
    }
});

export const {
    setIsLoading,
    setCreatePostModal,
    setImageFullScreenModal,
    setCommentModal,
    setSuccessModal,
    setActiveTab,
    resetActiveTab,
    setActiveFeedItem,
    setSearchText,
    refetchPosts
} = appSlice.actions;

export default appSlice.reducer;
