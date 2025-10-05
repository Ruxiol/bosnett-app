import { ScrollView } from "react-native"

import SafeAreaViewComponent from "../../../components/app/common/SafeAreaViewComponent/SafeAreaViewComponent"
import AuthContainer from "../../../components/auth/authContainer/authContainer"
import SignUpForm from "../../../components/auth/signUpForm/signUpForm"

const SignUp = () => {

    return (
        <SafeAreaViewComponent>
            <ScrollView>
                <AuthContainer children={<SignUpForm />} />
            </ScrollView>
        </SafeAreaViewComponent>
    )
}

export default SignUp
