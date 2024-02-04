export const setSearchTerm = (term) => ({
    type: 'SET_SEARCH_TERM',
    payload: term,
  });
  
  export const setApiDown = (value) => ({
    type: 'SET_API_DOWN',
    payload: value,
  });
  
  export const setData = (data) => ({
    type: 'SET_DATA',
    payload: data,
  });

  export const setSpeciesCounts = (counts) => ({
    type: 'SET_SPECIES_COUNTS',
    payload: counts,
  });
  