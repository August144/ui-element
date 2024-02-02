import React, {useEffect} from 'react';
import './App.css';
import {Container, Row, Col, Image} from "react-bootstrap";
import {useAppDispatch, useAppSelector} from "./redux/hooks";
import {DisplayMode, getLocalScores, getPlayerData, selectApp, setDisplayMode} from "./redux/appSlice";

/**
 * App component.
 *
 * This component renders the main application UI and handles data fetching and interval updates.
 *
 * @return {JSX.Element} The rendered App component.
 */
function App() {
  const appState = useAppSelector(selectApp);
  const dispatch = useAppDispatch();


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const displayMode = params.get("DM")

    if (displayMode)
      dispatch(setDisplayMode(displayMode as DisplayMode))

    dispatch(getPlayerData());

    const playerDataInterval = setInterval(() => {
      if (appState.displayMode === "MatchBox")
        dispatch(getPlayerData());
    }, 30000);
    const localScoreInterval = setInterval(() => {
      dispatch(getLocalScores());

    }, 1000);

    return () => {
      clearInterval(playerDataInterval);
      clearInterval(localScoreInterval);
    }
  });

  return (
    <div className="app">
      <Container>
        {appState.displayMode === "MatchBox" &&
            <Row style={{marginBottom: '10px'}}>
                <text
                    className="score-text">MMR: {appState.playerMMR}
                </text>
            </Row>
        }

        <Row>
          <Col className="left-col">
            <Image
              className="profile-picture"
              src="https://static-cdn.jtvnw.net/jtv_user_pictures/f4cdcadb-9481-41bd-854a-e58aa8489e78-profile_image-70x70.jpeg"/>
            <text className="score-text" style={{marginLeft: '10px'}}>| {appState.localPlayerGameWins}</text>
          </Col>
          <Col className="right-col">
            <text className="score-text" style={{marginRight: '10px'}}>{appState.localPlayerGameLosses} |</text>
            <Image
              className="profile-picture"
              src="opponent.png"/>
          </Col>
        </Row>
        {appState.displayMode === "MatchBox" &&
            <Row style={{marginTop: '10px'}}>
                <text
                    className="score-text">{appState.playerSetWins ? appState.playerSetWins : 0} W
                    - {appState.playerSetLosses ? appState.playerSetLosses : 0} L
                </text>
            </Row>
        }

      </Container>
    </div>
  );
}

export default App;
