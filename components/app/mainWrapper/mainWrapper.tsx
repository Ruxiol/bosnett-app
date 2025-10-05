import SafeAreaViewComponent from "../common/SafeAreaViewComponent/SafeAreaViewComponent";
import Footer from "../footer/footer";

import MainWrapperProps from "./interfaces/mainWrapperProps";

const MainWapper = (props: MainWrapperProps) => {
    const { isFooter = true } = props
    return (
        <SafeAreaViewComponent>
            {props.children}
            {isFooter && <Footer />}
        </SafeAreaViewComponent>
    )
}

export default MainWapper