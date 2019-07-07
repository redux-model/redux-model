import React, { CSSProperties, FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { counterModel } from '../models/CounterModel';

const styles: CSSProperties = {
  width: 300,
  height: 300,
  borderWidth: 1,
  borderColor: '#ddd',
  borderStyle: 'solid',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  margin: 20,
  padding: 15,
};

const Normal: FunctionComponent = () => {
  const dispatch = useDispatch();
  const count = counterModel.useData((data) => data.amount);

  const handleClick = useCallback(() => {
    dispatch(counterModel.increase.action());
  }, []);

  const handleReset = useCallback(() => {
    dispatch(counterModel.resetThunk());
  }, []);

  return (
    <div style={styles}>
      <h3>Normal Effect:</h3>
      <p>You clicked <span style={{ fontSize: 18, color: '#f00' }}>{count}</span> times.</p>
      <div>
        <button onClick={handleClick} style={{ width: 100, height: 30 }}>Click Button</button>
        &nbsp;&nbsp;
        <button onClick={handleReset} style={{ width: 80, height: 30 }}>Reset</button>
      </div>
    </div>
  );
};

export default Normal;
