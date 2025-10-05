import MediaUploadResponseData from "../../../../constants/interfaces/apisInterfaces/mediaUploadResponseData";
import IProfileData from "../../../../interfaces/IProfileData";

export default interface CreatePostResponse {
    _id: string;
    userdetail: IProfileData;
    description: string;
    media: MediaUploadResponseData[];
    date_posted: string;
}