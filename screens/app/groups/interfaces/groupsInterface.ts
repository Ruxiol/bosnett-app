import MediaUploadResponseData from "../../../../constants/interfaces/apisInterfaces/mediaUploadResponseData";
import IProfileData from "../../../../interfaces/IProfileData";

export default interface GroupsInterface {
    _id: string;
    type: string;
    date_created: string;
    ownerUserName: string;
    ownerId: string;
    name: string;
    image: MediaUploadResponseData;
    members: Pick<IProfileData, "userId" | "email" | "firstName" | "lastName" | "userName" | "profileImage">[];
    requested: Pick<IProfileData, "userId" | "email" | "firstName" | "lastName" | "userName" | "profileImage">[];
}