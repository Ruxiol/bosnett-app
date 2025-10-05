import UserValuePairs from "./userValuePairs";

export default interface IProfileData {
    _id?: string;
    email: string;
    userId: string;
    firstName: string;
    lastName: string;
    userName: string;
    dayOfBirth: string;
    profileImage: string;
    bio: string;
    socialMedia: UserValuePairs[];
    education: UserValuePairs[];
    workExperience: UserValuePairs[];
    friendRequestsReceived: IProfileData[];
    friends: IProfileData[];
    friendRequestsSent: IProfileData[];
    notificationToken: string;
    token?: string;
}