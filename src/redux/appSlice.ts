import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import axios from "axios";
import {RootState} from "./store";

/**
 * Represents the state of the application.
 *
 * @interface IAppState
 */
interface IAppState {
  displayMode: DisplayMode;
  playerId?: number;
  playerMMR?: number;
  playerWins?: number;
  playerLosses?: number;
  localPlayerWins: number;
  localPlayerLosses: number;
}

/**
 * The initial state for the application's state store.
 *
 * @typedef {Object} IAppState
 * @property {number} localPlayerWins - The number of wins for the local player.
 * @property {number} localPlayerLosses - The number of losses for the local player.
 */
const initialState: IAppState = {
  displayMode: "MatchBox",
  localPlayerWins: 0,
  localPlayerLosses: 0,
}

export type DisplayMode = "MatchBox" | "WL";

/**
 * Represents the interface for tracking wins and losses.
 *
 * @interface
 */
interface IWinsLosses {
  wins: number;
  losses: number;
}

/**
 * Represents the base statistics of a player.
 *
 * @interface IPlayerBaseStats
 */
interface IPlayerBaseStats {
  id: number;
  skillRating: ISkillRating;
}

/**
 * Represents a skill rating.
 * @interface
 */
interface ISkillRating {
  rating: number;
}

/**
 * Retrieves data from a server through a GET request.
 *
 * @param {string} url - The URL of the server endpoint.
 * @param {any} [params] - Optional parameters to be sent along with the request.
 * @returns {Promise<T>} - A promise that resolves with the data retrieved from the server.
 */
async function getDataFromServer<T>(url: string, params?: any): Promise<T> {
  const response = await axios.get<T>(url, {params: params});
  return response.data;
}

/**
 * Retrieves local scores from the server asynchronously.
 *
 * @return {ThunkAction<Promise<IWinsLosses>, RootState, unknown, Action<string>>} - The async thunk action that fetches the local scores.
 * @throws {Error} - If the server request fails.
 *
 * @example
 *  dispatch(getLocalScores())
 *    .then((result) => {
 *      // Handle successful response
 *    })
 *    .catch((error) => {
 *      // Handle error
 *    });
 */
export const getLocalScores = createAsyncThunk('app/getLocalScores', async (): Promise<IWinsLosses> => {
  return getDataFromServer<IWinsLosses>(`/LocalWinsLosses`);
});

/**
 * Retrieves player data from the server.
 * @param {undefined} _
 * @param {thunkAPI} thunkAPI - The thunk API object.
 * @returns {object} - The player data.
 */
export const getPlayerData = createAsyncThunk('app/getPlayerData', async (_, thunkAPI) => {
  const state = thunkAPI.getState() as RootState;

  let baseStats: IPlayerBaseStats;
  let winLoss: IWinsLosses;

  if (state.app.playerId) {
    [baseStats, winLoss] = await Promise.all([
      getDataFromServer<IPlayerBaseStats>(`/PlayerData`, {player_tag: process.env.REACT_APP_PLAYER_TAG!}),
      getDataFromServer<IWinsLosses>(`/PlayerWinsLosses`, {player_id: state.app.playerId})
    ]);
  } else {
    baseStats = await getDataFromServer<IPlayerBaseStats>(`/PlayerData`, {player_tag: process.env.REACT_APP_PLAYER_TAG!});
    winLoss = await getDataFromServer<IWinsLosses>(`/PlayerWinsLosses`, {player_id: baseStats.id});
  }

  return {
    playerId: baseStats.id,
    playerMMR: baseStats.skillRating.rating,
    playerWins: winLoss.wins,
    playerLosses: winLoss.losses,
  }
});

/**
 * The `appSlice` variable is an instance of the `createSlice` function, which creates a Redux slice for the 'app' state.
 *
 * @typedef {object} AppSlice
 * @property {string} name - The name of the Redux slice.
 * @property {object} initialState - The initial state of the Redux slice.
 * @property {object} reducers - The collection of Redux reducers for the slice.
 * @property {function} extraReducers - The function that adds extra Redux reducers to the slice.
 *
 * @typedef {object} Action
 * @property {string} type - The type of the action.
 * @property {any} payload - The payload of the action.
 *
 * @callback ReducerFunction
 * @param {object} state - The current state of the slice.
 * @param {Action} action - The action being dispatched.
 * @returns {void}
 *
 * @param {object} initialState - The initial state of the 'app' slice.
 * @returns {AppSlice} The created Redux slice for the 'app' state.
 */
export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setDisplayMode: (state, action: PayloadAction<DisplayMode>) => {
      state.displayMode = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(getPlayerData.fulfilled, (state, action) => {
        state.playerId = action.payload.playerId;
        state.playerMMR = action.payload.playerMMR;
        state.playerWins = action.payload.playerWins;
        state.playerLosses = action.payload.playerLosses;
      })
      .addCase(getLocalScores.fulfilled, (state, action) => {
        state.localPlayerWins = action.payload.wins;
        state.localPlayerLosses = action.payload.losses;
      })
  }
});

/**
 * Retrieves the app property from the state object.
 *
 * @param {Object} state - The state object.
 * @returns {Object} - The app property from the state object.
 */

export const {setDisplayMode} = appSlice.actions;

export const selectApp = (state: { app: IAppState }) => state.app;
export default appSlice.reducer;
