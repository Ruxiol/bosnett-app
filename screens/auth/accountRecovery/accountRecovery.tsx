import { ScrollView } from "react-native"

import AccountRecoveryForm from "../../../components/auth/accountRecoveryForm/accountRecoveryForm"
import SafeAreaViewComponent from "../../../components/app/common/SafeAreaViewComponent/SafeAreaViewComponent"
import AuthContainer from "../../../components/auth/authContainer/authContainer"

const AccountRecovery = () => {
    return (
        <SafeAreaViewComponent>
            <ScrollView>
                <AuthContainer children={<AccountRecoveryForm />} />
            </ScrollView>
        </SafeAreaViewComponent>
    )
}

export default AccountRecovery