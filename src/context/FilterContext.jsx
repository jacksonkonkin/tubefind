import { createContext, useContext, useReducer, useCallback } from 'react';

const FilterContext = createContext(null);

const LEVEL_COUNT = 6;

const LEVEL_LABELS = [
  'Mood / Intent',
  'Category / Domain',
  'Format / Style',
  'Tone & Energy',
  'Freshness & Popularity',
  'Creator Preferences',
];

const initialState = {
  currentLevel: 1,
  selections: {
    level_1: null,
    level_2: [],
    level_3: null,
    level_4: null,
    level_5: null,
    level_6: {},
  },
};

function filterReducer(state, action) {
  switch (action.type) {
    case 'SET_SELECTION': {
      const { level, value } = action.payload;
      return {
        ...state,
        selections: {
          ...state.selections,
          [`level_${level}`]: value,
        },
      };
    }
    case 'GO_TO_LEVEL':
      return {
        ...state,
        currentLevel: Math.max(1, Math.min(LEVEL_COUNT + 1, action.payload)),
      };
    case 'NEXT_LEVEL':
      return {
        ...state,
        currentLevel: Math.min(LEVEL_COUNT + 1, state.currentLevel + 1),
      };
    case 'PREV_LEVEL':
      return {
        ...state,
        currentLevel: Math.max(1, state.currentLevel - 1),
      };
    case 'RESET':
      return { ...initialState };
    default:
      return state;
  }
}

export function FilterProvider({ children }) {
  const [state, dispatch] = useReducer(filterReducer, initialState);

  const setSelection = useCallback((level, value) => {
    dispatch({ type: 'SET_SELECTION', payload: { level, value } });
  }, []);

  const goToLevel = useCallback((level) => {
    dispatch({ type: 'GO_TO_LEVEL', payload: level });
  }, []);

  const nextLevel = useCallback(() => {
    dispatch({ type: 'NEXT_LEVEL' });
  }, []);

  const prevLevel = useCallback(() => {
    dispatch({ type: 'PREV_LEVEL' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const value = {
    ...state,
    levelCount: LEVEL_COUNT,
    levelLabels: LEVEL_LABELS,
    setSelection,
    goToLevel,
    nextLevel,
    prevLevel,
    reset,
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
