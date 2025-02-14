/**
 * Copyright 2025 Syeda Momina Rashid RO SINC Lab NRDI
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { Component } from "react";
import { connect } from "react-redux";
import { setMapFlagFilter, setMapNameFilter, setMapTypeFilter, setMapValueFilter, updateFilters, clearFilters } from "../actions/filters";

import './style/Filters.css';

class Filters extends Component {
  constructor(props) {
    super(props);
    this.state = {
      flag: "",
      type: "",
      quantity: "",
      operator: "=", // Default operator
      vesselName: ""
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value }, () => {
      this.props.updateFilters(this.state);
    });
  };

  handleOperatorChange = (e) => {
    this.setState({ operator: e.target.value });
  };

  handleClear = () => {
    this.setState({ flag: "", type: "", quantity: "", operator: "=", vesselName: "" });
    this.props.clearFilters();
  };

  render() {
    return (
      <div className="Filter-Container">
        <select name="flag" value={this.state.flag} onChange={this.handleChange}>
          <option value="">Select Flag/Country</option>
          <option value="USA">USA</option>
          <option value="UK">UK</option>
          <option value="China">China</option>
        </select>

        <select name="type" value={this.state.type} onChange={this.handleChange}>
          <option value="">Select Type</option>
          <option value="Cargo">Cargo</option>
          <option value="Fishing">Fishing</option>
          <option value="Military">Military</option>
        </select>

        <div className="quantity-filter">
          <select value={this.state.operator} onChange={this.handleOperatorChange}>
            <option value="=">=</option>
            <option value=">">&gt;</option>
            <option value="<">&lt;</option>
          </select>
          <input
            type="number"
            name="quantity"
            value={this.state.quantity}
            onChange={this.handleChange}
            placeholder="Quantity"
          />
        </div>

        <input
          type="text"
          name="vesselName"
          value={this.state.vesselName}
          onChange={this.handleChange}
          placeholder="Search Vessel Name"
        />

        <button onClick={this.handleClear}>Clear Filters</button>
      </div>
    );
  }
}

const mapDispatchToProps = {
  updateFilters,
  clearFilters,
};

export default connect(null, mapDispatchToProps)(Filters);


// export default connect((state) => ({
//     currentTaskBlocked: state.task.blocked
// }), {
//     setCurrentTask: setCurrentTask,
//     setMenuMargin: setMenuMargin
// })(AppMenu);
