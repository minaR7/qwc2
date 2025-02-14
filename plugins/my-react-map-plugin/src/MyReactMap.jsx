import React from 'react';
import ReactDOM from 'react-dom';
import MyMap from './MyMap/MyMap';

class MyReactMapPlugin extends React.Component {
  componentDidMount() {
    const root = document.getElementById('my-react-map-root');
    ReactDOM.render(<MyMap />, root);
  }

  render() {
    return <div id="my-react-map-root"></div>;
  }
}

export default MyReactMapPlugin;