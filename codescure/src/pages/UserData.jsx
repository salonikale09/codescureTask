import React, { useEffect, useState } from 'react';
import { useTable, usePagination, useSortBy, useGlobalFilter } from 'react-table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserSecret, faUserCircle, faQuestion, faExclamationCircle, faExclamationTriangle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import './css/UserData.css';
import { useDispatch, useSelector } from 'react-redux';



function UserData() {
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortOption, setSortOption] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState([]);
  const speciesCounts = {};
  const dispatch = useDispatch();
  const searchTerm = useSelector((state) => state.search.searchTerm);
  const { apiDown } = useSelector((state) => state.api);
  const { data } = useSelector((state) => state.data);

  const url = "https://swapi.dev/api/people/";
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${url}?search=${searchTerm}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const result = await response.json();
          const enrichedData = await Promise.all(result.results.map(async (item) => {
            const speciesData = item.species && item.species.length > 0 ? await fetch(item.species[0]).then(res => res.json()) : null;
            return {
              ...item,
              speciesData: speciesData,
            };
          }));
          
          
          // Dispatch the action to set data globally
          dispatch({ type: 'SET_DATA', payload: enrichedData });

          // Calculate species counts
          const newSpeciesCounts = calculateSpeciesCounts(enrichedData);

          // Dispatch the action to set species counts globally
          dispatch({ type: 'SET_SPECIES_COUNTS', payload: newSpeciesCounts });
        } else {
          dispatch({ type: 'SET_API_DOWN', payload: true });
        }
      } catch (error) {
        setError(error);
        dispatch({ type: 'SET_API_DOWN', payload: true });
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTerm, dispatch]);



  const calculateSpeciesCounts = (data) => {
    const counts = {};
    data.forEach((item) => {
      const speciesType = item.speciesData && item.speciesData.name ? item.speciesData.name : 'Unknown';
      counts[speciesType] = (counts[speciesType] || 0) + 1;
    });
    return counts;
  };

  // Counting Total Details
  data.forEach((item) => {
    const speciesType = item.speciesData && item.speciesData.name ? item.speciesData.name : 'Unknown';
    speciesCounts[speciesType] = (speciesCounts[speciesType] || 0) + 1;
  });

  const getSpeciesIcon = (speciesData) => {
    if (speciesData && speciesData.name) {
      switch (speciesData.name.toLowerCase()) {
        case 'droid':
          return faUserSecret;
        case 'human':
          return faUserCircle;
        default:
          return faQuestion;
      }
    } else {
      return faQuestion;
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
      },
      {
        Header: 'Height',
        accessor: 'height',
      },
      {
        Header: 'Mass',
        accessor: 'mass',
      },
      {
        Header: 'Hair Color',
        accessor: 'hair_color',
      },
      {
        Header: 'Skin Color',
        accessor: 'skin_color',
      },
      {
        Header: 'Species',
        accessor: 'speciesData',
        Cell: ({ value }) => {
          const speciesIcon = getSpeciesIcon(value);
          return <FontAwesomeIcon icon={speciesIcon} />;
        },
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    page,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
  } = useTable(
    {
      columns,
      data: filteredData,
      initialState: { pageIndex: 0, pageSize: 6 },
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  useEffect(() => {
    // Apply sorting based on sortOption and sortOrder
    const sortedData = sortData(filteredData, sortOption, sortOrder);
  
    // Only update the state if sorting changes the order
    if (!arraysAreEqual(sortedData, filteredData)) {
      setFilteredData(sortedData);
    }
  }, [filteredData, sortOption, sortOrder]);
  
  function arraysAreEqual(array1, array2) {
    if (array1.length !== array2.length) {
      return false;
    }
  
    for (let i = 0; i < array1.length; i++) {
      if (array1[i] !== array2[i]) {
        return false;
      }
    }
  
    return true;
  }

  
  

  useEffect(() => {
    // Apply global filter
    const filtered = data.filter((row) => {
      const values = Object.values(row);
      return values.some((value) => {
        if (value && typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        } else if (value && value.name) {
          return value.name.toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      });
    });
    setFilteredData(filtered);
  }, [data, searchTerm]);

  const sortData = (data, key, order) => {
    if (key && order) {
      return [...data].sort((a, b) => {
        if (key === 'name') {
          return a[key].localeCompare(b[key]) * (order === 'asc' ? 1 : -1);
        } else {
          return (parseFloat(a[key]) - parseFloat(b[key])) * (order === 'asc' ? 1 : -1);
        }
      });
    } else {
      return data;
    }
  };

  const handleSort = (option) => {
    switch (option) {
      case 'nameAsc':
        setSortOption('name');
        setSortOrder('asc');
        break;
      case 'nameDesc':
        setSortOption('name');
        setSortOrder('desc');
        break;
      case 'heightAsc':
        setSortOption('height');
        setSortOrder('asc');
        break;
      case 'heightDesc':
        setSortOption('height');
        setSortOrder('desc');
        break;
      case 'massAsc':
        setSortOption('mass');
        setSortOrder('asc');
        break;
      case 'massDesc':
        setSortOption('mass');
        setSortOrder('desc');
        break;
      default:
        setSortOption(null);
        setSortOrder('asc');
    }
  };

  return (
    <div>
      {/* When Api is Down Show faExclamationCircle  */}
      {apiDown && (
        <div style={{ textAlign: 'center', color: 'red', marginBottom: '10px' }}>
          <FontAwesomeIcon icon={faExclamationCircle} size="2x" />
          <p>Oops! Something went wrong. Please try again later.</p>
        </div>
      )}

      <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => dispatch({ type: 'SET_SEARCH_TERM', payload: e.target.value })}
        placeholder="Search..."
      />

        {/* Show loading state with spinner icon */}
        {loading && (
          <div style={{ textAlign: 'center', marginTop: '10px' }}>
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            <p>Loading...</p>
          </div>
        )}

        {/* when there is no data in Api show faSearch */}
        {data.length === 0 && !apiDown && !loading && (
          <div style={{ textAlign: 'center', color: 'orange', marginTop: '10px' }}>
            <FontAwesomeIcon icon={faExclamationTriangle} size="2x" />
            <p>No data found. Please try a different search term.</p>
          </div>
        )}

        <select
          value={sortOption ? `${sortOption}${sortOrder === 'desc' ? 'Desc' : 'Asc'}` : ''}
          onChange={(e) => handleSort(e.target.value)}
        >
          <option value="">Sort by</option>
          <option value="nameAsc">Name (Ascending)</option>
          <option value="nameDesc">Name (Descending)</option>
          <option value="heightAsc">Height (Ascending)</option>
          <option value="heightDesc">Height (Descending)</option>
          <option value="massAsc">Mass (Ascending)</option>
          <option value="massDesc">Mass (Descending)</option>
        </select>
      </div>

      <table {...getTableProps()} style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  onClick={() => column.canSort && handleSort(column.id)}
                  style={{ border: '1px solid black', padding: '8px', cursor: column.canSort ? 'pointer' : 'default' }}
                >
                  {column.render('Header')}
                  {column.isSorted ? (column.isSortedDesc ? ' 🔽' : ' 🔼') : ''}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} style={{ border: '1px solid black', padding: '8px' }}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          Previous Page
        </button>
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          Next Page
        </button>
      </div>

      
<div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
  {/* Show cards containing counts for total results, total droid, total human, etc. */}
  {Object.entries(speciesCounts).map(([species, count]) => (
    <div key={species} className="species-card">
      <h4>{species.toUpperCase()}</h4>
      <p>{count}</p>
    </div>
  ))}

  {/* Display count of humans even if it's 0 */}
  {speciesCounts['human'] === undefined && (
    <div className="species-card">
      <h4>HUMAN</h4>
      <p>0</p>
    </div>
  )}
</div>

    </div>
  );
}

export default UserData;
