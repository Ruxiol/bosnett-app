import { View, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, TouchableWithoutFeedback, Keyboard, Text, Dimensions, ScrollView, Image, Modal, ImageBackground } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { useFormik } from "formik";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import * as Yup from 'yup';

import { RPH, RPW, RFS } from "../../../constants/utils/utils";
import { Picker } from "@react-native-picker/picker";
import Apis from "../../../constants/apis";
import Icons from "../../../constants/icons";
import useSliceSelector from "../../../hooks/useSliceSelector";
import GroupsInterface from "./interfaces/groupsInterface";
import useToken from "../../../hooks/useToken";
import MainWapper from "../../../components/app/mainWrapper/mainWrapper";
import AppHeader from "../../../components/app/appHeader/appHeader";
import useErrorHandling from "../../../hooks/useErrorHandling";
import requestUtils from "../../../constants/utils/requestUtils";
import MediaUploadResponseData from "../../../constants/interfaces/apisInterfaces/mediaUploadResponseData";
import RootStackParamListInterface from "../../../interfaces/RootStackParamListInterface";

const { width } = Dimensions.get("window");

// first is padding second is gap
const boxWidth = (width - RPW(3) * 2 - RPW(2) * 3) / 4;

const Groups = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamListInterface>>();
    const { getToken } = useToken();
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [groupsData, setGroupsData] = useState<GroupsInterface[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [imagePreview, setImagePreview] = useState("");
    const messages = useSliceSelector(state => state.language.messages);
    const { handleError } = useErrorHandling();
    const formik = useFormik({
        initialValues: {
            name: "",
            type: "Public",
            image: null,
        },
        validationSchema: Yup.object().shape({
            name: Yup.string().required("Name is required"),
            image: Yup.mixed().nonNullable().required("Image is required")
        }),
        onSubmit: () => {
            uploadImages();
        },
    });

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            result.assets.map((image) => {
                let filename = image.uri.split('/').pop();
                let uri = image.uri;

                let match = /\.(\w+)$/.exec(filename as string);
                let type = match ? `image/${match[1]}` : `image`;
                formik.setFieldValue("image", { uri, type, filename: filename || "" })
            });
            setImagePreview(result.assets[0].uri);
        }
    };

    const uploadImages = useCallback(async () => {
        const accessToken = await getToken();
        if (!accessToken) return;

        setIsLoading(true);
        const formData = new FormData();
        // @ts-ignore: Unreachable code error
        formData.append("file", { uri: formik.values.image.uri, type: formik.values.image.type, name: formik.values.image.filename })

        try {
            const { data } = await requestUtils.request<MediaUploadResponseData[], FormData>(
                Apis.uploadMedia,
                'POST',
                formData,
                { 'Authorization': `Bearer ${accessToken}` },
                true
            );
            await createGroup(data[0]._id);
        } catch (error) {
            handleError(error);
        }
    }, [getToken, formik])

    const filteredGroups = groupsData.filter(item => {
        const itemText = item.name.toLowerCase();
        return itemText.includes(searchQuery.toLowerCase());
    });

    const getGroups = useCallback(async () => {
        try {
            const accessToken = await getToken();
            if (!accessToken) return;

            let config = {
                method: "get",
                url: Apis.groupsApi,
                headers: {
                    "Authorization": `Bearer ${accessToken}`
                }
            };

            axios.request(config)
                .then((response) => {
                    setGroupsData(response.data.data);
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.log(error);
                });

        } catch (e) {
            console.log(e)
        }
    }, []);

    const createGroup = useCallback(async (id: string) => {
        const accessToken = await getToken();
        if (!accessToken) return;

        let data = JSON.stringify({
            "name": formik.values.name,
            "type": formik.values.type,
            "image": id
        });

        let config = {
            method: "post",
            maxBodyLength: Infinity,
            url: "https://app.bosnett.com/api/v1/createGroup",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                setIsLoading(false);
                setModalVisible(false);
                getGroups();
            })
            .catch((error) => {
                console.log(error);
            });

    }, [formik.values]);

    useEffect(() => {
        getGroups();
    }, [getGroups]);

    const navigateToUserDetails = useCallback((id: string) => {
        navigation.navigate("Group", { id });
    }, [navigation]);

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        )
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <MainWapper>
                <View style={styles.container}>
                    <AppHeader headerText={messages.myGroups} icon={true} />
                    <View style={styles.iconContainer}>
                        <View style={styles.icon}>
                            {Icons.inputSearchIcon}
                        </View>
                        <TextInput
                            placeholder={messages.searchGroups}
                            style={styles.input}
                            value={searchQuery}
                            onChangeText={(text) => setSearchQuery(text)}
                        />
                    </View>
                    <ScrollView>
                        <View style={styles.groupContainer}>
                            {
                                filteredGroups.map((item, index) => {
                                    return (
                                        <TouchableOpacity
                                            key={index}
                                            style={styles.groupBox}
                                            onPress={() => navigateToUserDetails(item._id)}
                                        >
                                            <View>
                                                <Image
                                                    source={{ uri: `${Apis.homeUrl}${item.image.path}` }}
                                                    style={styles.roundImg}
                                                />
                                                <View style={styles.textContainer}>
                                                    <Text style={styles.groupName} numberOfLines={1}>{item.name}</Text>
                                                    <Text style={{ fontSize: 9, color: "#FFF" }}>
                                                        Members: {item.members.length}
                                                    </Text>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    )
                                })
                            }
                        </View>
                    </ScrollView>
                </View>
                <TouchableOpacity style={styles.addGroupButton} onPress={() => setModalVisible(true)}>
                    <Text style={styles.addGroupButtonText}>Create New Group</Text>
                </TouchableOpacity>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}
                >
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text>Add New Group</Text>
                            <View style={{ width: "100%", marginTop: 20, gap: 20 }}>
                                <View style={{ gap: 10 }}>
                                    <Text>Group Name</Text>
                                    <TextInput
                                        onChangeText={(text) => formik.setFieldValue("name", text)}
                                        style={[styles.input, { marginHorizontal: 0, paddingLeft: 10 }]}
                                    />
                                    <Text style={{ color: "red", fontSize: 12 }}>{formik.errors.name}</Text>
                                </View>
                                <View style={{ gap: 10 }}>
                                    <TouchableOpacity onPress={pickImage}>
                                        <Text>Select Image</Text>
                                    </TouchableOpacity>
                                    {formik.errors.image && <Text style={{ color: "red", fontSize: 12 }}>{formik.errors.image}</Text>}
                                    {imagePreview && <Image
                                        style={{ height: 100, width: 100, borderRadius: 10 }}
                                        source={{ uri: imagePreview }}
                                    />}
                                </View>
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%", marginTop: 50 }}>
                                <TouchableOpacity style={styles.confirmButton} onPress={() => formik.handleSubmit()}>
                                    <Text style={styles.addGroupButtonText}>Confirm</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                    <Text style={styles.addGroupButtonText}>Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </MainWapper>
        </TouchableWithoutFeedback>
    )
}

export default Groups

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    groupName: {
        fontWeight: "400",
        fontFamily: "Lato-Regular",
        fontSize: 12,
        color: "#F9F9F9",
        paddingBottom: 2
    },
    container: {
        paddingTop: RPH(1.6),
        flex: 1,
        backgroundColor: "#fff"
    },
    iconContainer: {
        position:
            "relative"
    },
    textContainer: {
        alignItems: "center",
    },
    icon: {
        position: "absolute",
        left: RPW(7.8),
        top: RPH(1.7)
    },
    input: {
        backgroundColor: "rgba(0, 0, 0, 0.05)",
        marginHorizontal: RPW(5.9),
        color: "#8E8E93",
        fontSize: RFS(17),
        fontFamily: "Lato-Regular",
        fontWeight: "400",
        paddingVertical: RPH(1.3),
        borderRadius: 10,
        paddingHorizontal: RPW(7.8)
    },
    groupContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: RPW(3),
        gap: RPW(2),
        alignItems: "center",
        paddingTop: RPH(1.6),
    },
    groupBox: {
        backgroundColor: "#3E3E3E",
        borderRadius: 5,
        paddingHorizontal: RPW(2),
        paddingVertical: RPH(2.2),
        borderWidth: 1,
        alignItems: "center",
        width: boxWidth
    },
    circle: {
        width: RPW(10.6),
        justifyContent: "center",
        alignItems: "center",
        marginBottom: RPH(.5)
    },
    roundImg: {
        borderRadius: 50,
        width: "100%",
        objectFit: "contain",
        height: RPH(5.1)
    },
    addGroupButton: {
        backgroundColor: "#308AFF",
        position: "absolute",
        bottom: 100,
        left: "30%",
        width: 150,
        justifyContent: "center",
        alignItems: "center",
        height: 40,
        borderRadius: 20
    },
    addGroupButtonText: {
        color: "#fff"
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        height: "70%",
        width: "90%"
    },
    confirmButton: {
        backgroundColor: "#308AFF",
        width: 120,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10
    },
    cancelButton: {
        backgroundColor: "red",
        width: 120,
        height: 30,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10
    }
})