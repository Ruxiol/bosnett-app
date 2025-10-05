import { StyleSheet, View, Image, ScrollView, TouchableOpacity, ImageProps } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ImagePickerOptions } from "expo-image-picker";
import moment from "moment";

import AppHeader from "../../../../components/app/appHeader/appHeader";
import MainWapper from "../../../../components/app/mainWrapper/mainWrapper";
import TextBold from "../../../../components/app/common/textComponent/textBold/textBold";
import TextRegular from "../../../../components/app/common/textComponent/textRegular/textRegular";
import ImagePickerButtonsModal from "../../../../modals/imagePickerButtonsModal/imagePickerButtonsModal";
import EditProfileFieldsModal from "../../../../modals/editProfileFieldsModal/editProfileFieldsModal";
import Loader from "../../../../components/common/loader";

import { RPH, getColorForUser, getUserInitials } from "../../../../constants/utils/utils";
import Apis from "../../../../constants/apis";
import requestUtils from "../../../../constants/utils/requestUtils";

import useErrorHandling from "../../../../hooks/useErrorHandling";
import useSliceSelector from "../../../../hooks/useSliceSelector";
import useReducerDispatch from "../../../../hooks/useReducerDispatch";
import useSuccessHandling from "../../../../hooks/useSuccessHandling";
import useImagePicker from "../../../../hooks/useImagePicker";
import useToken from "../../../../hooks/useToken";

import { setUserData } from "../../../../reducers/auth/authSlice";
import { setIsLoading } from "../../../../reducers/app/appSlice";

import IProfileData from "../../../../interfaces/IProfileData";
import ImageInterface from "../../../../components/common/interfaces/imageInterface";

const editImgIcon = require("../../../../assets/icons/editImg.png");
const editUsernameIcon = require("../../../../assets/icons/editUsername.png");
const editDobIcon = require("../../../../assets/icons/editDob.png");
const editBioIcon = require("../../../../assets/icons/editBio.png");
const editPhoneIcon = require("../../../../assets/icons/editPhone.png");
const editArrowIcon = require("../../../../assets/icons/editArrowR.png");
const editEduIcon = require("../../../../assets/icons/editEdu.png");
const editSocialsIcon = require("../../../../assets/icons/editSocials.png");
const editWorkIcon = require("../../../../assets/icons/editWork.png");

const EditProfile = () => {
    const userData = useSliceSelector(state => state.auth.userData);
    const isLoading = useSliceSelector(state => state.app.isLoading);
    const [editingField, setEditingField] = useState("");
    const [editValue, setEditValue] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [showButtons, setShowButtons] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [firstName, setFirstName] = useState(userData?.firstName || "");
    const [lastName, setLastName] = useState(userData?.lastName || "");
    const messages = useSliceSelector(state => state.language.messages);
    const [socialMedia, setSocialMedia] = useState(userData?.socialMedia || []);
    const [education, setEducation] = useState(userData?.education || []);
    const [workExperience, setWorkExperience] = useState(userData?.workExperience || []);
    const { handleError } = useErrorHandling();
    const dispatch = useReducerDispatch();
    const { handleSuccess } = useSuccessHandling();
    const { getToken } = useToken();
    const { handleImagePicker } = useImagePicker();

    const handleSaveKeyValuePair = useCallback((field: string, index: number, name: string, value: string) => {
        let updatedArray;
        switch (field) {
            case 'socialMedia':
                updatedArray = [...socialMedia];
                updatedArray[index] = { name, value };
                setSocialMedia(updatedArray);
                break;
            case 'education':
                updatedArray = [...education];
                updatedArray[index] = { name, value };
                setEducation(updatedArray);
                break;
            case 'workExperience':
                updatedArray = [...workExperience];
                updatedArray[index] = { name, value };
                setWorkExperience(updatedArray);
                break;
        }
    }, [socialMedia, education, workExperience]);

    const handleAddKeyValuePair = useCallback((field: string) => {
        let updatedArray;
        switch (field) {
            case 'socialMedia':
                updatedArray = [...socialMedia, { name: '', value: '' }];
                setSocialMedia(updatedArray);
                break;
            case 'education':
                updatedArray = [...education, { name: '', value: '' }];
                setEducation(updatedArray);
                break;
            case 'workExperience':
                updatedArray = [...workExperience, { name: '', value: '' }];
                setWorkExperience(updatedArray);
                break;
        }
    }, [socialMedia, education, workExperience]);

    const handleRemoveKeyValuePair = useCallback((field: string, index: number) => {
        let updatedArray;
        switch (field) {
            case 'socialMedia':
                updatedArray = [...socialMedia];
                updatedArray.splice(index, 1);
                setSocialMedia(updatedArray);
                break;
            case 'education':
                updatedArray = [...education];
                updatedArray.splice(index, 1);
                setEducation(updatedArray);
                break;
            case 'workExperience':
                updatedArray = [...workExperience];
                updatedArray.splice(index, 1);
                setWorkExperience(updatedArray);
                break;
        }
    }, [socialMedia, education, workExperience]);

    const handleProfileUpdate = useCallback(async (file?: ImageInterface) => {
        const accessToken = await getToken();
        if (!accessToken) return;

        try {
            dispatch(setIsLoading(true))
            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${accessToken}`);

            const formdata = new FormData();
            if (editingField && editValue &&
                editingField != 'firstName' &&
                editingField != 'socialMedia' &&
                editingField != 'education' &&
                editingField != 'workExperience') {
                formdata.append(editingField, editValue);
            }

            if (firstName !== userData?.firstName) {
                formdata.append("firstName", firstName);
            }

            if (lastName !== userData?.lastName) {
                formdata.append("lastName", lastName);
            }

            if (file) {
                // @ts-ignore: Unreachable code error
                formdata.append("image", { uri: file.uri, type: file.type, name: file.filename });
            }

            socialMedia.forEach((item, index) => {
                if (userData.socialMedia.length !== socialMedia.length && item.name && item.value) {
                    formdata.append(`socialMedia[${index}][name]`, item.name);
                    formdata.append(`socialMedia[${index}][value]`, item.value);
                }
            });

            education.forEach((item, index) => {
                if (userData.education.length !== education.length && item.name && item.value) {
                    formdata.append(`education[${index}][name]`, item.name);
                    formdata.append(`education[${index}][value]`, item.value);
                }
            });

            workExperience.forEach((item, index) => {
                if (userData.workExperience.length !== workExperience.length && item.name && item.value) {
                    formdata.append(`workExperience[${index}][name]`, item.name);
                    formdata.append(`workExperience[${index}][value]`, item.value);
                }
            });

            const { data, message } = await requestUtils.request<IProfileData, FormData>(
                Apis.profileApi,
                'POST',
                formdata,
                myHeaders,
                true
            );

            dispatch(setUserData(data));
            dispatch(setIsLoading(false))
            handleSuccess(message);
        } catch (error) {
            dispatch(setIsLoading(false))
            handleError(error);
        }
    }, [firstName, lastName, editingField, editValue, socialMedia, education, workExperience, getToken, dispatch, handleError, handleSuccess]);

    const pickImage = async (action: string, options?: ImagePickerOptions) => {
        const selectedImage = await handleImagePicker(action, options);
        if (selectedImage && selectedImage.length > 0) {
            setShowButtons(false);
            handleProfileUpdate(selectedImage[0]);
        }
    };

    const showUploadButtons = useCallback(() => {
        setShowButtons(!showButtons)
    }, []);

    const handleEditClick = useCallback((fieldName: string, value: string) => {
        setShowDatePicker(fieldName === "dayOfBirth");
        setEditingField(fieldName)
        setEditValue(value)
        setIsModalVisible(true);
    }, []);

    const handleSave = useCallback(() => {
        if (!editingField) {
            setIsModalVisible(false);
            return;
        }

        setIsModalVisible(false);
        handleProfileUpdate();
    }, [editingField, handleProfileUpdate]);

    const handleDateChange = useCallback((event: DateTimePickerEvent, date: Date) => {
        if (event.type === 'dismissed') {
            setShowDatePicker(false);
            return;
        }
        if (date) {
            const formattedDate = moment(date).format("YYYY/MM/DD");
            setSelectedDate(date);
            setEditingField('dayOfBirth')
            setEditValue(formattedDate);
            setShowDatePicker(false);
        }
    }, []);

    useEffect(() => {
        if (editValue && editingField === 'dayOfBirth') {
            handleProfileUpdate();
        }
    }, [editValue, editingField]);

    const EditField = ({
        fieldName,
        value,
        icon,
        label,
        borderBottom = true
    }: {
        fieldName: string,
        value: string,
        icon: ImageProps,
        label: string,
        borderBottom?: boolean
    }
    ) => (
        <TouchableOpacity
            onPress={fieldName === "dayOfBirth"
                ? () => setShowDatePicker(true)
                : () => handleEditClick(fieldName, value)}
        >
            <View style={styles.editField}>
                <View style={styles.fieldText}>
                    <View style={fieldName === "firstName" ? styles.iconContainer
                        : fieldName === "education" ? styles.iconContainerEd
                            : fieldName === "workExperience" ? styles.iconContainerWork
                                : styles.iconContainerWithout}>
                        <Image source={icon} />
                    </View>
                    <TextRegular fontSize={17}>{label}</TextRegular>
                </View>
                <View style={styles.arrowContainer}>
                    <TextRegular fontSize={17} color="rgba(0, 0, 0, 0.35)">Edit</TextRegular>
                    <Image source={editArrowIcon} />
                </View>
            </View>
            {borderBottom && (
                <View style={styles.borderBottom}></View>
            )}
        </TouchableOpacity>
    );

    const name = `${userData.firstName} ${userData.lastName}`;
    const extraSpacing = !showButtons ? { paddingBottom: 35 } : { paddingBottom: 20 };
    const userInitials = useMemo(() => getUserInitials(name), [userData]);
    const loggedInUserColor = useMemo(() => getColorForUser(userData.userId), []);

    const fieldGroups = [
        {
            heading: messages.personalInfo,
            fields: [
                { fieldName: "firstName", icon: editUsernameIcon, label: userData.firstName || messages.name, value: name, borderBottom: true },
                { fieldName: "dayOfBirth", icon: editDobIcon, label: userData.dayOfBirth || messages.birthday, value: userData.dayOfBirth, borderBottom: true },
                { fieldName: "bio", icon: editBioIcon, label: userData.bio || messages.biography, value: userData.bio, borderBottom: false },
            ],
        },
        {
            heading: messages.contactInfo,
            fields: [
                { fieldName: "phone", icon: editPhoneIcon, label: messages.phone, value: "phone", borderBottom: false }
            ],
        },
        {
            heading: messages.preferences,
            fields: [
                { fieldName: "education", icon: editEduIcon, label: messages.education, value: userData.education, borderBottom: true },
                { fieldName: "socialMedia", icon: editSocialsIcon, label: messages.socials, value: userData.socialMedia, borderBottom: true },
                { fieldName: "workExperience", icon: editWorkIcon, label: messages.work, value: userData.workExperience, borderBottom: false },
            ],
        },
    ];

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <MainWapper>
            <View style={styles.container}>
                <AppHeader icon={true} />
                <ScrollView>
                    <View style={styles.content}>
                        <TouchableOpacity style={styles.circle} onPress={showUploadButtons}>
                            {userData.profileImage
                                ? <TouchableOpacity style={styles.circle} onPress={showUploadButtons}>
                                    <Image style={styles.roundImg} source={{ uri: `${Apis.homeUrl}${userData.profileImage}` }} />
                                </TouchableOpacity>
                                : <TouchableOpacity
                                    style={[styles.circle, { backgroundColor: loggedInUserColor }]}
                                    onPress={showUploadButtons}
                                >
                                    <TextBold fontSize={40} color='#fff'>
                                        {userInitials}
                                    </TextBold>
                                </TouchableOpacity>
                            }
                            <View style={styles.editImage}>
                                <Image source={editImgIcon} />
                            </View>
                        </TouchableOpacity>
                        <TextBold fontSize={23} style={[styles.spacing, extraSpacing]}>
                            {messages.editProfile}
                        </TextBold>
                        {fieldGroups.map((group, index) => {
                            return (
                                <View key={index} style={styles.fieldContainer}>
                                    <TextBold style={styles.prefText} fontSize={15} color="rgba(0, 0, 0, 0.35)">
                                        {group.heading}
                                    </TextBold>
                                    <View style={styles.editFieldsContainer}>
                                        {group.fields.map((field, fieldIndex) => {
                                            return (
                                                <EditField
                                                    key={fieldIndex}
                                                    fieldName={field.fieldName}
                                                    icon={field.icon}
                                                    value={field.value as string}
                                                    label={field.label}
                                                    borderBottom={field.borderBottom}
                                                />
                                            )
                                        })}
                                    </View>
                                </View>
                            )
                        })}
                    </View>
                </ScrollView>
            </View>
            <ImagePickerButtonsModal
                handleImagePicker={pickImage}
                showButtons={showButtons}
                setShowButtons={setShowButtons}
            />
            <EditProfileFieldsModal
                isModalVisible={isModalVisible}
                setIsModalVisible={setIsModalVisible}
                editingField={editingField}
                setEditValue={setEditValue}
                setFirstName={setFirstName}
                setLastName={setLastName}
                handleSave={handleSave}
                value={editValue}
                firstName={firstName}
                lastName={lastName}
                handleAddKeyValuePair={handleAddKeyValuePair}
                handleSaveKeyValuePair={handleSaveKeyValuePair}
                handleRemoveKeyValuePair={handleRemoveKeyValuePair}
                keyValuePairs={
                    editingField === 'socialMedia' ? socialMedia :
                        editingField === 'education' ? education :
                            editingField === 'workExperience' ? workExperience :
                                []
                }
            />
            {showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="spinner"
                    onChange={(event, date) => {
                        if (date) {
                            handleDateChange(event, date);
                        }
                    }}
                />
            )}
        </MainWapper>
    )
}

export default memo(EditProfile);

const styles = StyleSheet.create({
    container: {
        backgroundColor: "#FFFDFA",
        flex: 1,
        paddingTop: RPH(4),
        position: "relative"
    },
    spacing: {
        paddingTop: 20
    },
    fieldContainer: {
        width: '100%',
        paddingHorizontal: 30
    },
    editImage: {
        width: 36,
        height: 25,
        backgroundColor: "#5890FF",
        borderRadius: 6,
        position: "absolute",
        bottom: -1,
        justifyContent: "center",
        alignItems: "center"
    },
    prefText: {
        alignSelf: "flex-start",
        paddingLeft: 20,
        paddingTop: 20,
        paddingBottom: 9
    },
    content: {
        alignItems: "center"
    },
    circle: {
        width: 139,
        height: 139,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 6,
        borderColor: "#5890FF",
        borderRadius: 70,
        position: "relative",
        overflow: "hidden"
    },
    roundImg: {
        width: "100%",
        height: "100%"
    },
    editField: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 10,
        justifyContent: "space-between"
    },
    fieldText: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 12
    },
    editFieldsContainer: {
        display: "flex",
        paddingBottom: 16
    },
    arrowContainer: {
        display: "flex",
        flexDirection: "row",
        gap: 12,
        alignItems: "center"
    },
    iconContainer: {
        backgroundColor: "#000",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center"
    },
    iconContainerWithout: {
        justifyContent: "center",
        alignItems: "center"
    },
    iconContainerEd: {
        backgroundColor: "#8A54FF",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center"
    },
    iconContainerWork: {
        backgroundColor: "#131CA8",
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center"
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: "rgba(0, 0, 0, 0.12)",
        alignSelf: "flex-end",
        width: '75%',
        display: "flex",
        marginRight: 20
    }
})