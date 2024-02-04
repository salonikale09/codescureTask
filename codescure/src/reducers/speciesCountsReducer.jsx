const initialState = {
    speciesCounts: {},
  };
  
  const speciesCountsReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_SPECIES_COUNTS':
        return {
          ...state,
          speciesCounts: action.payload,
        };
      default:
        return state;
    }
  };

  export default speciesCountsReducer;
