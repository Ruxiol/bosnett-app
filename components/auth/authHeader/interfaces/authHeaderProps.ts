export default interface AuthHeaderProps {
    currentStep?: number;
    goBackToPreviousStep?: () => void;
    showBackIcon: boolean;
    formik?: {
        setFieldValue: (field: string, value: string, shouldValidate?: boolean | undefined) => void;
    };
}