import { FormikProps } from 'formik';

import SignUpEmailValuesInterface from './signUpEmailValues';

export default interface SignUpEmailProps {
    formik: FormikProps<SignUpEmailValuesInterface>;
}