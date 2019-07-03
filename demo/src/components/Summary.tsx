import React, { CSSProperties, FunctionComponent } from 'react';
import { summaryModel } from '../models/normal/SummaryModel';

const styles: CSSProperties = {
  width: 300,
  height: 300,
  padding: 15,
  borderWidth: 1,
  borderColor: '#ddd',
  borderStyle: 'solid',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'center',
  margin: 20,
};

const Summary: FunctionComponent = () => {
  const { times, lastTime } = summaryModel.useData();

  return (
    <div style={styles}>
      <h3>Summary:</h3>
      <p>You have clicked buttons <span style={{ fontSize: 20, color: '#f00' }}>{times}</span> times.</p>
      <p>Last click time: </p>
      <p>{lastTime || '--'}</p>
    </div>
  );
};

export default Summary;
