import React, {useEffect, useState} from 'react';
import './App.css';
import {Container, Row, Col, Image, ProgressBar} from "react-bootstrap";
import {useAppDispatch, useAppSelector} from "./redux/hooks";
import {getLocalScores, getPlayerData, selectApp} from "./redux/appSlice";

function App() {
  // const [playerDataInterval, setPlayerDataInterval] = useState(null);
  // const [localScoreInterval, setLocalScoreInterval] = useState(null);
  const appState = useAppSelector(selectApp);
  const dispatch = useAppDispatch();


  useEffect(() => {
    dispatch(getPlayerData());

    const playerDataInterval = setInterval(() => {
      dispatch(getPlayerData());
    }, 15000);
    const localScoreInterval = setInterval(() => {
      dispatch(getLocalScores());

    }, 1000);

    return () => {
      clearInterval(playerDataInterval);
      clearInterval(localScoreInterval);
    }
  });

  return (
    <div className="App">
      <Container>
        <Row style={{marginBottom: '10px'}}>
          <text
            className="score-text">MMR: {appState.playerMMR}
          </text>
        </Row>
        <Row>
          <Col className="left-col">
            <Image
              className="PFP"
              src="https://static-cdn.jtvnw.net/jtv_user_pictures/f4cdcadb-9481-41bd-854a-e58aa8489e78-profile_image-70x70.jpeg"/>
            <text className="score-text" style={{marginLeft: '10px'}}>| {appState.localPlayerWins}</text>
          </Col>
          <Col className="right-col">
            <text className="score-text" style={{marginRight: '10px'}}>{appState.localPlayerLosses} |</text>
            <Image
              className="PFP"
              src="blank_pfp.jpg"/>
          </Col>
        </Row>
        <Row style={{marginTop: '10px'}}>
          <text
            className="score-text">{appState.playerWins} W - {appState.playerLosses} L
          </text>
        </Row>
      </Container>

    </div>
  );
}

export default App;
