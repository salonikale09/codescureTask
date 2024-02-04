const initialState = {
    apiDown: false,
  };
  
  const apiReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'SET_API_DOWN':
        return {
          ...state,
          apiDown: action.payload,
        };
      default:
        return state;
    }
  };

  export default apiReducer;
