import ImageInterface from "../../../common/interfaces/imageInterface";

export default interface SignUpFormInterface {
    email: string;
    confirmEmail?: string;
    password: string;
    confirmPassword?: string;
    firstName: string;
    lastName: string;
    userName: string;
    dayOfBirth: Date | string;
    agreeToTerms?: boolean;
    image: ImageInterface;
}