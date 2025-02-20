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
      name: "",
      ssr_country: "all",
      ssr_boat_name: "",
      ssr_own_ship: "",	
      ssr_no_of_crew: "",
      ssr_boat_regno: "",
      layerName: "",
      vessel_id: "",
      vessel_ssvid: "",
      vessel_flag: "all",
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
    console.log("layer filter", name, value, this.props.options.drawingOrder);
  
    // // Check if props.id is 'Patrol'
    let updatedLayerName = this.props.options.drawingOrder;
  
    // // If props.id is "Patrol", remove the first element from drawingOrder
    // if (this.props?.options?.title === "Patrol Type") {
    //   updatedLayerName = this.props.options.drawingOrder.slice(1); // Remove the first element
    // }
    if (this.props?.options?.id === "pak_fishing_density_areas.qgz") {
        updatedLayerName = this.props.options.drawingOrder[2]; // Remove the first element
    }
    else if (this.props?.options?.id === "all_vessels_fishing_density_areas_in_pak.qgz") {
        updatedLayerName = ['eez_density','ecs_density' ]; // Remove the first element
    } 
    else {
      // If not "Patrol", retain the layerName as a single value
      updatedLayerName = [this.props.options.drawingOrder[1]];
    }
  
    this.setState(
      {
        [name]: value,
        // layerName: [this.props.options.drawingOrder[1]],
        layerName: updatedLayerName, // Set layerName as an array when it's "Patrol"
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
      name: "",
      layerName: "",
      ssr_country: "all",
      ssr_boat_name: "",
      ssr_own_ship: "",	
      ssr_no_of_crew: "",
      ssr_boat_regno: "",
      vessel_id: "",
      vessel_ssvid: "",
      vessel_flag: "all",
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
                {this.props?.options?.title === "Patrol Type" && (
                  <>
                    {/* Flag/Country Dropdown */}
                    <Form.Item label="Flag">
                      <Select
                          placeholder="Select Country"
                          value={this.state.ssr_country}
                          onChange={(value) => this.handleChange("ssr_country", value)}
                          style={{width: "80%"}}
                      >
                          <Option value="all">All</Option>
                          <Option value="INDIA">India</Option>
                          <Option value="PAKISTAN">Pakistan</Option>
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
                        placeholder="No of Crew"
                        value={this.state.ssr_no_of_crew}
                        onChange={(e) => this.handleChange("ssr_no_of_crew", e.target.value)}
                        style={{ width: "70%" }}
                        />
                    </Input.Group>
                    </Form.Item>
                    {/* Vessel Name Search */}
                    <Form.Item label="Search Boat">
                    <Input
                        placeholder="Enter Boat Name"
                        value={this.state.ssr_boat_name}
                        onChange={(e) => this.handleChange("ssr_boat_name", e.target.value)}
                    />
                    </Form.Item>
                    <Form.Item label="Search Unit">
                    <Input
                        placeholder="Enter Unit Name"
                        value={this.state.ssr_own_ship}
                        onChange={(e) => this.handleChange("ssr_own_ship", e.target.value)}
                    />
                    </Form.Item>
                    <Form.Item label="Search Reg No">
                    <Input
                        placeholder="Enter Reg No"
                        value={this.state.ssr_boat_regno}
                        onChange={(e) => this.handleChange("ssr_boat_regno", e.target.value)}
                    />
                    </Form.Item>
                    <Form.Item>
                      <Button onClick={this.handleClear} type="default">
                          Clear Filters
                      </Button>
                    </Form.Item>
                  </>
                )}
                {
                this.props?.options?.id === "pak_fishing_density_areas.qgz" && (
                  <>
                  {/*Type Dropdown */}
                  <Form.Item label="Type">
                    <Select
                        placeholder="Select Type"
                        value={this.state.type}
                        onChange={(value) => this.handleChange("type", value)}
                        style={{width: "100%"}}
                    >
                        <Option value="">All</Option>
                        <Option value="all">AU</Option>
                    </Select>
                  </Form.Item>
                  {/* Vessel Name Search */}
                  <Form.Item label="Search Vessel">
                  <Input
                      placeholder="Enter Vessel Name"
                      value={this.state.name}
                      onChange={(e) => this.handleChange("name", e.target.value)}
                  />
                  </Form.Item>
                  <Form.Item>
                    <Button onClick={this.handleClear} type="default">
                        Clear Filters
                    </Button>
                  </Form.Item>
                  </>
                )
                }
                {
                this.props?.options?.id === "all_vessels_fishing_density_areas_in_pak.qgz" && (
                  <>
                    {/* Vessel Name Search */}
                    <Form.Item label="Search Vessel">
                    <Input
                        placeholder="Enter Vessel Name"
                        value={this.state.vessel_name}
                        onChange={(e) => this.handleChange("vessel_name", e.target.value)}
                    />
                    </Form.Item>                  
                    {/* Vessel ID Search */}
                    <Form.Item label="Search Vessel ID">
                    <Input
                        placeholder="Enter Vessel ID"
                        value={this.state.vessel_id}
                        onChange={(e) => this.handleChange("vessel_id", e.target.value)}
                    />
                    </Form.Item>                  
                    {/* Vessel SSVID Search */}
                    <Form.Item label="Search Vessel SSVID">
                    <Input
                        placeholder="Enter Vessel SSVID"
                        value={this.state.vessel_ssvid}
                        onChange={(e) => this.handleChange("vessel_ssvid", e.target.value)}
                    />
                    </Form.Item>
                    {/* Flag/Country Dropdown */}
                    <Form.Item label="Flag">
                      <Select
                          placeholder="Select Flag"
                          value={this.state.vessel_flag}
                          onChange={(value) => this.handleChange("vessel_flag", value)}
                          style={{width: "80%"}}
                      >
                          <Option value="all">All</Option>
                          <Option value="PAK">Pakistan</Option>
                          <Option value="IND">India</Option>
                          <Option value="IRN">Iran</Option>
                          <Option value="GRC">Greece</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item>
                      <Button onClick={this.handleClear} type="default">
                          Clear Filters
                      </Button>
                    </Form.Item>
                  </>
                )
                }

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
