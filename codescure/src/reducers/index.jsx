import { combineReducers } from 'redux';
import searchReducer from './searchReducer';
import apiReducer from './apiReducer';
import dataReducer from './dataReducer';
import speciesCountsReducer from './speciesCountsReducer';

const rootReducer = combineReducers({
  search: searchReducer,
  api: apiReducer,
  data: dataReducer,
  speciesCounts: speciesCountsReducer,
});

export default rootReducer;
