import ShimmerPlaceHolder from 'react-native-shimmer-placeholder';

import ShimmerProps from './interfaces/shimmerProps';

const Shimmer = (props: ShimmerProps) => {
    const { height, isLoading, width, borderRadius, marginLeft, marginRight } = props;

    return (
        <ShimmerPlaceHolder
            shimmerColors={['#eee']}
            visible={!isLoading}
            style={{
                width,
                height,
                borderRadius,
                marginLeft,
                marginRight
            }}
        />
    )
}

export default Shimmer;