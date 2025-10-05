import { useDispatch } from 'react-redux';

import { RootDispatch } from '../store';

const useReducerDispatch = () => useDispatch<RootDispatch>();

export default useReducerDispatch;
