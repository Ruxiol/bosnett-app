import { FormikProps } from "formik";

import SignUpPasswordValuesInterface from "./signUpPasswordValuesInterface";

export default interface SignUpPasswordProps {
    formik: FormikProps<SignUpPasswordValuesInterface>;
}