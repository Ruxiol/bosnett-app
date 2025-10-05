import IProfileData from "../../../interfaces/IProfileData";

export default interface SubCommentResponse {
    _id: string;
    userdetail: IProfileData;
    comment: string;
    commentId: string;
    createdDate: string;
}