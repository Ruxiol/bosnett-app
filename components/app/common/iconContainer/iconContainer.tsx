import { Svg } from "react-native-svg"

import IconContainerProps from "./interfaces/IconContainerProps"

const IconContainer = (props: IconContainerProps) => {
    return (
        <Svg {...props}>
            {props.children}
        </Svg>
    )
}

export default IconContainer