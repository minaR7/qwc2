import filterReducer from '../reducers/filters';
import ReducerIndex from '../reducers/index';
ReducerIndex.register("filter", filterReducer);

export const SET_MAP_FILTER = "SET_MAP_FILTER";
export const SET_MAP_FLAG_FILTER = "SET_MAP_FLAG_FILTER";
export const SET_MAP_NAME_FILTER = "SET_MAP_NAME_FILTER";
export const SET_MAP_TYPE_FILTER = "SET_MAP_TYPE_FILTER";
export const SET_MAP_VALUE_FILTER = "SET_MAP_VALUE_FILTER";

export const setMapFilter = (param) => ({
  type: SET_MAP_FILTER,
  param: param,
});

export const setMapFlagFilter = (param) => ({
  type: SET_MAP_FLAG_FILTER,
  param: param,
});

export const setMapNameFilter = (param) => ({
  type: SET_MAP_NAME_FILTER,
  param: param,
});

export const setMapTypeFilter = (param) => ({
  type: SET_MAP_TYPE_FILTER,
  param: param,
});

export const setMapValueFilter = (param) => ({
  type: SET_MAP_VALUE_FILTER,
  param: param,
});

export const UPDATE_FILTERS = "UPDATE_FILTERS";
export const CLEAR_FILTERS = "CLEAR_FILTERS";

// Action to update filters
export const updateFilters = (filters) => ({
  type: UPDATE_FILTERS,
  payload: filters,
});

// Action to reset all filters
export const clearFilters = () => ({
  type: CLEAR_FILTERS,
});


