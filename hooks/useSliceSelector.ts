import { useSelector, TypedUseSelectorHook } from 'react-redux';

import { RootState } from '../store';

const useSliceSelector: TypedUseSelectorHook<RootState> = useSelector;

export default useSliceSelector
