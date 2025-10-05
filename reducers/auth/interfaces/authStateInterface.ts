import IProfileData from "../../../interfaces/IProfileData";

export default interface AuthStateInterface {
    isAuthenticated: boolean;
    isLoading: boolean;
    userData: IProfileData;
}