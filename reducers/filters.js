import { SET_MAP_FILTER, UPDATE_FILTERS, CLEAR_FILTERS,
  SET_MAP_FLAG_FILTER, SET_MAP_NAME_FILTER, SET_MAP_TYPE_FILTER, SET_MAP_VALUE_FILTER  } from "../actions/filters";

const initialState = {
  filterParam: null,
    flag: "",
    type: "",
    vessel_name: "",
    name: "",
    quantity: "",
    quantityOperator: "=",
    layerName: "",
    ssr_country: "",
    ssr_boat_name: "",
    ssr_own_ship: "",	
    ssr_no_of_crew: "",
    ssr_boat_regno: "",
    vessel_id: "",
    vessel_ssvid: "",
    vessel_flag: "",

};

const filterReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_MAP_FILTER:
      console.log("Filter reducer:",action, state)
      return { ...state, filterParam: action.param };
    case SET_MAP_FLAG_FILTER:
      console.log("Filter reducer:",action, state)
      return { ...state, flag: action.param };
    case SET_MAP_NAME_FILTER:
      console.log("Filter reducer:",action, state)
      return { ...state, vessel_name: action.param };
    case SET_MAP_TYPE_FILTER:
      console.log("Filter reducer:",action, state)
      return { ...state, type: action.param };
    case SET_MAP_VALUE_FILTER:
      console.log("Filter reducer:",action, state)
      return { ...state, quantity: action.param, quantity };
    case UPDATE_FILTERS:
      console.log(action.payload)
      return { ...state, ...action.payload };
    case CLEAR_FILTERS:
      return initialState;
    default:
      return state;
  }
};
// update the Updtae_filters case and pass the query prametrs e.g. if flag exists then write narco:"flag" = 'value'
export default filterReducer;
