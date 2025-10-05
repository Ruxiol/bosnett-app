import IProfileData from "../../../../interfaces/IProfileData";

export default interface ReactionsInterface {
    _id: string;
    userdetail: IProfileData;
    reaction: string;
    createdDate: string;
}