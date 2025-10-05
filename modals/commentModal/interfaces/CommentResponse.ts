import IProfileData from "../../../interfaces/IProfileData";

export default interface CommentResponse {
    _id: string;
    userdetail: IProfileData;
    comment: string;
    createdDate: string;
}