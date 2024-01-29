import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axios, {AxiosResponse} from "axios";
import {RootState} from "./store";

interface IAppState {
  playerTag: string;
  playerId?: number;
  playerMMR?: number;
  playerWins?: number;
  playerLosses?: number;
  localPlayerWins: number;
  localPlayerLosses: number;
}

const initialState: IAppState = {
  playerTag: "gsmvoid",
  localPlayerWins: 0,
  localPlayerLosses: 0,
}

interface IWinsLosses {
  wins: number;
  losses: number;
}

interface IPlayerBaseStats {
  id: number;
  username: string;
  profileImage: string;
  discordId: string;
  discord: null;
  beta: boolean;
  role: string;
  regionId: string;
  banned: boolean;
  createdAt: string;
  updatedAt: string;
  skillRatings: ISkillRating[];
  region: IRegion;
  skillRating: ISkillRating;
}

interface ISkillRating {
  rating: number;
  season: ISeason;
}

interface ISeason {
  id: number;
  name: string;
}

interface IRegion {
  id: string;
  name: string;
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {},
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

export const getLocalScores = createAsyncThunk('app/getLocalScores', async (): Promise<IWinsLosses> => {
  const response = await axios.get<IWinsLosses>(
    `/LocalWinsLosses`,
  );

  return response.data;
});

export const getPlayerData = createAsyncThunk('app/getPlayerData', async (_, thunkAPI) => {
  const state = thunkAPI.getState() as RootState;

  let baseStats: IPlayerBaseStats;
  let winLoss: IWinsLosses;

  if (state.app.playerId) {
    [baseStats, winLoss] = await Promise.all([getPlayerBaseStats(state.app.playerTag), getPlayerWinLosses(state.app.playerId)]);
  } else {
    baseStats = await getPlayerBaseStats(state.app.playerTag);
    winLoss = await getPlayerWinLosses(baseStats.id);
  }

  return {
    playerTag: state.app.playerTag,
    playerId: baseStats.id,
    playerMMR: baseStats.skillRating.rating,
    playerWins: winLoss.wins,
    playerLosses: winLoss.losses,
  }
});


async function getPlayerBaseStats(tag: string): Promise<IPlayerBaseStats> {
  const response = await axios.get<IPlayerBaseStats>(
    `/PlayerData?player_tag=${tag}`,
  );

  return response.data;
}


async function getPlayerWinLosses(playerId: number): Promise<IWinsLosses> {
  const response = await axios.get<IWinsLosses>(
    `/PlayerWinsLosses?player_id=${playerId}`,
  );

  return response.data;
}

export const selectApp = (state: { app: IAppState }) => state.app;

export default appSlice.reducer;
