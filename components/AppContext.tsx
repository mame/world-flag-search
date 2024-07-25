import React, {
  FC,
  Context,
  createContext,
  Dispatch,
  useEffect,
  useReducer,
} from 'react';
import Feature from '../lib/Feature';
import FlagDB, { Item } from '../lib/FlagDB';

export type State =
  | { type: 'loading'; progress: number; feature?: Feature }
  | { type: 'failed' }
  | { type: 'running'; ranking: Item[]; all: boolean; feature: Feature };

export type Action =
  | { type: 'progress'; percentage: number }
  | { type: 'start' }
  | { type: 'update'; feature: Feature }
  | { type: 'error' }
  | { type: 'extend' };

const flagDBReducer = (state: State, action: Action): State => {
  switch (state.type) {
    case 'loading':
      switch (action.type) {
        case 'progress':
          return { ...state, progress: action.percentage };
        case 'start': {
          if (!state.feature) return { type: 'failed' };
          const [ranking, all] = FlagDB.updateRanking(state.feature, 0, 10);
          return { type: 'running', ranking, all, feature: state.feature };
        }
        case 'update':
          return { ...state, feature: action.feature };
        case 'error':
          return { type: 'failed' };
      }
      return state;
    case 'failed':
      return state;
    case 'running':
      switch (action.type) {
        case 'update': {
          const [ranking, all] = FlagDB.updateRanking(state.feature, 0, 10);
          return { ...state, ranking, all, feature: state.feature };
        }
        case 'extend': {
          const [ranking, all] = FlagDB.updateRanking(
            state.feature,
            state.ranking.length,
            10
          );
          return { ...state, ranking, all, feature: state.feature };
        }
      }
      return state;
  }
};

type AppContextType = {
  state: State;
  dispatch: Dispatch<Action>;
};
const AppContext: Context<AppContextType> = createContext({} as AppContextType);

type Props = {
  children: React.ReactNode;
};
export const AppContextProvider: FC<Props> = ({ children }) => {
  const [state, dispatch] = useReducer(flagDBReducer, {
    type: 'loading',
    progress: 0,
  });

  useEffect(() => {
    const bulkLoad = async () => {
      try {
        await FlagDB.loadImages((percentage) => {
          dispatch({ type: 'progress', percentage });
        });
        dispatch({ type: 'start' });
      } catch (err) {
        dispatch({ type: 'error' });
      }
    };
    bulkLoad();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
