import React, { CSSProperties, FunctionComponent, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { npmInfoModel } from '../models/NpmInfoModel';

const styles: CSSProperties = {
  width: 600,
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

const Request: FunctionComponent = () => {
  const dispatch = useDispatch();
  const npmInfo = npmInfoModel.useData();
  const loading = npmInfoModel.manage.useLoading();

  const handleClick = useCallback(() => {
    dispatch(npmInfoModel.manage.action('react-native'))
      .promise
      .then(({ response }) => {
        console.log(`Wow, You got response from ${response._id}`);
      });
  }, []);

  const handleClick1 = useCallback(() => {
    dispatch(npmInfoModel.manage.action('node'));
  }, []);

  const handleClick2 = useCallback(() => {
    dispatch(npmInfoModel.manage.action('not-existed-package'));
  }, []);

  const handleReset = useCallback(() => {
    dispatch(npmInfoModel.reset.action());
  }, []);

  return (
    <div style={styles}>
      <h3 style={{ textAlign: 'center', width: '100%' }}>Fetch Effect:</h3>
      <p>Package: {npmInfo._id || '--'}</p>
      <p>License: {npmInfo.license || '--'}</p>
      <p>Homepage: {npmInfo.homepage || '--'}</p>
      <div>
        <button
          onClick={handleClick}
          style={{ width: 120, height: 30 }}
        >
          React-native info
        </button>
        &nbsp;&nbsp;
        <button
          onClick={handleClick1}
          style={{ width: 100, height: 30 }}
        >
          Node.js info
        </button>
        &nbsp;&nbsp;
        <button
          onClick={handleClick2}
          style={{ width: 100, height: 30 }}
        >
          Click and fail
        </button>
        &nbsp;&nbsp;
        <button
          onClick={handleReset}
          style={{ width: 80, height: 30 }}
        >
          Reset
        </button>
        &nbsp;&nbsp;
        {loading && <b style={{ color: 'green' }}>I am fetching...</b>}
      </div>
    </div>
  );
};

export default Request;
