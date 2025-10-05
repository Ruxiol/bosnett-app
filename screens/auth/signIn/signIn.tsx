import { ScrollView } from 'react-native'

import SignInForm from '../../../components/auth/signInForm/signInForm'
import AuthContainer from '../../../components/auth/authContainer/authContainer'
import SafeAreaViewComponent from '../../../components/app/common/SafeAreaViewComponent/SafeAreaViewComponent'

const SignIn = () => {

  return (
    <SafeAreaViewComponent>
      <ScrollView>
        <AuthContainer children={<SignInForm />} />
      </ScrollView>
    </SafeAreaViewComponent>
  )
}

export default SignIn
