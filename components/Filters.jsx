import React, { Component } from "react";
import { connect } from "react-redux";
import { Select, Input, Button, Form } from "antd";
import { updateFilters, clearFilters } from "../actions/filters";

import "./style/Filters.css";

const { Option } = Select;
import PropTypes from 'prop-types';

class Filters extends React.Component
// class  extends Component 
{
    static propTypes = {
      filters: PropTypes.object,
      options: PropTypes.object,
    };
  constructor(props) {
    super(props);
    this.state = {
      flag: "all",
      type: "",
      quantity: "",
      operator: "=",
      vessel_name: "",
      layerName: "",
    };
  }

  componentDidMount() {
    console.log("Filters component mounted");
    console.log(this)
    // Fetch any required initial data or apply stored filters if needed
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState !== this.state) {
      console.log("previous",prevProps, prevState, "\nFilters component updated:", this.state);
      this.props.updateFilters(this.state);
    }
  }

  componentWillUnmount() {
    console.log("Filters component will unmount");
    // Perform cleanup if needed
  }

  // handleChange = (name, value) => {
  //   this.setState({ [name]: value }, () => {
  //     this.props.updateFilters(this.state);
  //   });
  // };

  extractLayerName = (id) => {
    return id ? id.split(".")[0] : "";
  };

  handleChange = (name, value) => {
    console.log("layer",name, value, this.props.options.drawingOrder[1])
    this.setState(
      {
        [name]: value,
        layerName: this.props.options.drawingOrder[1]
        // layerName: this.extractLayerName(this.props?.options?.id), // Only set when a filter value is updated
      },
      () => {
        this.props.updateFilters(this.state);
      }
    );
  };

  handleClear = () => {
    this.setState({
      flag: "all",
      type: "",
      quantity: "",
      operator: "=",
      vessel_name: "",
      layerName: "",
    });
    this.props.clearFilters();
  };
  render() {
    return (
        <div className="Filter-Container">
            <Form layout="horizontal" className="filter-container">
                {this.props?.options?.title === "Contraband Drug Confiscation" && (
                  <>
                    {/* Flag/Country Dropdown */}
                    <Form.Item label="Flag">
                      <Select
                          placeholder="Select Flag"
                          value={this.state.flag}
                          onChange={(value) => this.handleChange("flag", value)}
                          style={{width: "100%"}}
                      >
                          <Option value="all">All</Option>
                          <Option value="Irani">Irani</Option>
                          <Option value="PAKISTAN">Pakistan</Option>
                          <Option value="stateless">Stateless</Option>
                      </Select>
                    </Form.Item>
                      {/* Quantity + Operator */}
                    <Form.Item label="Quantity">
                    <Input.Group compact>
                        <Select
                        value={this.state.operator}
                        onChange={(value) => this.handleChange("operator", value)}
                        style={{ width: "30%" }}
                        >
                        <Option value="=">=</Option>
                        <Option value=">">&gt;</Option>
                        <Option value="<">&lt;</Option>
                        </Select>
                        <Input
                        type="number"
                        placeholder="Quantity"
                        value={this.state.quantity}
                        onChange={(e) => this.handleChange("quantity", e.target.value)}
                        style={{ width: "70%" }}
                        />
                    </Input.Group>
                    </Form.Item>
                    {/* Vessel Name Search */}
                    <Form.Item label="Search Vessel">
                    <Input
                        placeholder="Enter Vessel Name"
                        value={this.state.vessel_name}
                        onChange={(e) => this.handleChange("vessel_name", e.target.value)}
                    />
                    </Form.Item>

                    <Form.Item>
                      <Button onClick={this.handleClear} type="default">
                          Clear Filters
                      </Button>
                    </Form.Item>
                  </>
                )}


                {/* Type Dropdown */}
                {/* <Form.Item label="Vessel Type">
                <Select
                    placeholder="Select Type"
                    value={this.state.type}
                    onChange={(value) => this.handleChange("type", value)}
                >
                    <Option value="">All</Option>
                    <Option value="Cargo">Cargo</Option>
                    <Option value="Fishing">Fishing</Option>
                    <Option value="Military">Military</Option>
                </Select>
                </Form.Item> */}

                {/* Buttons */}

            </Form>
        </div>
    );
  }
}

const mapDispatchToProps = {
  updateFilters,
  clearFilters,
};

export default connect((state) => ({
  filters: state
}), mapDispatchToProps)(Filters);
