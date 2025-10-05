import { memo, useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Modal, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ButtonsInterface from "../../components/app/common/multiButtons/interfaces/buttonsInterface";
import MultiButtons from "../../components/app/common/multiButtons/multiButtons";

import Apis from "../../constants/apis";
import Icons from "../../constants/icons";
// ❌ više ne koristimo requestUtils ni useToken ovdje – idemo direktno fetch
// import requestUtils from "../../constants/utils/requestUtils";

import useErrorHandling from "../../hooks/useErrorHandling";
import useSliceSelector from "../../hooks/useSliceSelector";
import useSuccessHandling from "../../hooks/useSuccessHandling";
// import useToken from "../../hooks/useToken";

import IErrorResponse from "../../interfaces/IErrorResponse";
import PostOptionsModalProps from "./interfaces/postOptionsModalProps";

const PostOptionsModal = (props: PostOptionsModalProps) => {
  const { isModalVisible, setIsModalVisible, postId, setPosts } = props;
  const messages = useSliceSelector((state) => state.language.messages);
  const { handleError } = useErrorHandling();
  const { handleSuccess } = useSuccessHandling();
  const [isLoading, setIsLoading] = useState(false);

  const test = (val: string | undefined) => {
    console.log(val);
  };

  const deletePost = useCallback(async () => {
    if (!postId) return;

    try {
      setIsLoading(true);

      // WP token iz AsyncStorage (spašen na loginu)
      const wpToken = await AsyncStorage.getItem("wpToken");

      // (Opcionalno) app JWT — koristi se ako si u backendu dodao fallback (Authorization → user.wpToken)
      let appToken: string | null = null;
      const rawApp = await AsyncStorage.getItem("token");
      if (rawApp) {
        try {
          const parsed = JSON.parse(rawApp);
          appToken = typeof parsed === "string" ? parsed : null;
        } catch {
          appToken = rawApp;
        }
      }

      // Headeri: prioritet X-WP-Token; dodatno Authorization ako postoji
      const headers: Record<string, string> = {};
      if (wpToken) headers["X-WP-Token"] = wpToken;
      if (appToken) headers["Authorization"] = `Bearer ${appToken}`;

      const url = `${Apis.newsFeedApi}/${postId}`;
      const resp = await fetch(url, {
        method: "DELETE",
        headers,
      });

      if (!resp.ok) {
        const txt = await resp.text();
        throw new Error(`Delete ${resp.status}: ${txt}`);
      }

      // Očekujemo JSON; fallback na prazan objekat
      let payload: Partial<IErrorResponse> & { message?: string } = {};
      try {
        payload = await resp.json();
      } catch {
        // ignore non-JSON
      }

      handleSuccess(payload?.message || messages?.deletedSuccessfully || "Deleted.");
      setPosts && setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [postId, handleError, handleSuccess, setPosts, messages]);

  useEffect(() => {
    if (!isLoading) {
      setIsModalVisible(false);
    }
  }, [isLoading, setIsModalVisible]);

  const buttons: ButtonsInterface[] = [
    {
      label: messages.pin,
      action: () => test(postId),
      icon: Icons.pinIcon,
    },
    {
      label: messages.report,
      action: () => test(postId),
      icon: Icons.reportIcon,
    },
    {
      label: messages.delete,
      action: deletePost,
      icon: Icons.delIcon,
    },
  ];

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={() => {
        setIsModalVisible(false);
      }}
    >
      <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
        <View style={styles.modalContainer}>
          {isLoading ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : (
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.modalView}>
                <MultiButtons buttons={buttons} />
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default memo(PostOptionsModal);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    position: "relative",
  },
  modalView: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 10,
  },
  loaderContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "50%",
  },
});
