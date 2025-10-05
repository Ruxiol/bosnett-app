import { ParamListBase } from "@react-navigation/native";

import chatRoomParamsInterface from "./chatRoomInterface";
import SignInParamsInterface from "./signInParamsInterface";
import IProfileData from "./IProfileData";

export default interface RootStackParamListInterface extends ParamListBase {
    SignIn: SignInParamsInterface | undefined;
    SignUp: undefined;
    AccountRecovery: undefined;
    Home: undefined;
    Menu: undefined;
    Groups: undefined;
    Friends: undefined;
    Messenger: undefined;
    NewMessage: undefined;
    ChatRoom: chatRoomParamsInterface;
    UserProfile: undefined;
    Notifications: undefined;
    EditProfile: undefined;
    UserDetails: IProfileData | undefined;
    Language: undefined;
}