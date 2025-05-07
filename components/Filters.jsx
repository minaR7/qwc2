import React, { Component } from "react";
import { connect } from "react-redux";
import { Select, Input, Button, Form, DatePicker } from "antd";
import { updateFilters, clearFilters } from "../actions/filters";
import dayjs from "dayjs";
import PropTypes from 'prop-types';
import "./style/Filters.css";

const { Option } = Select;
const { RangePicker } = DatePicker;

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
        dtg: "",
        name: "",
        date: "",
        ssr_country: "all",
        ssr_boat_name: "",
        ssr_own_ship: "",	
        ssr_no_of_crew: "",
        ssr_boat_regno: "",
        layerName: "",
        vessel_id: "",
        vessel_ssvid: "",
        vessel_flag: "all",
        ssr_dtg: "",
        ais_type_summary: "",
        timestamp: "",
        // timestamp: [
        //   dayjs("2023-03-01").format("YYYY-MM-DD"), 
        //   dayjs("2023-03-10").format("YYYY-MM-DD")
        // ],
        destination: "",
        current_port: "",
        begin: "",
        end: "",
        start: "",
        end2: "",
        date_all_flag_heatmap: "",
        date_new: "",
      };
    }

    componentDidMount() {
      console.log("Filters component mounted", this);
      let is_filter = 0; 
      const newTimestamp = [
        dayjs("01-09-2023", "DD-MM-YYYY"),
        dayjs("15-09-2023", "DD-MM-YYYY")
      ];
    
      // this.setState({ timestamp: newTimestamp, layerName: ["eez_density"] }, () => {
      //   this.props.updateFilters({ timestamp: newTimestamp });
      // });
    }

    componentDidUpdate(prevProps, prevState) {
      if (prevState !== this.state) {
        // console.log("previous",prevProps, prevState, "\nFilters component updated:", this.state);
        this.props.updateFilters(this.state);
      }
    }

    componentWillUnmount() {
      console.log("Filters component will unmount");
      // Perform cleanup
    }

    extractLayerName = (id) => {
      return id ? id.split(".")[0] : "";
    };

  handleChange = (name, value) => {
    // console.log("layer filter", name, value, this.props.options.drawingOrder);
  
    // // Check if props.id is 'Patrol'
    let updatedLayerName = this.props.options.drawingOrder;
  
    // // If props.id is "Patrol", remove the first element from drawingOrder
    // if (this.props?.options?.title === "Patrol Type") {
    //   updatedLayerName = this.props.options.drawingOrder.slice(1); // Remove the first element
    // }
    if (this.props?.options?.id === "pak_fishing_density_areas.qgz") {
        updatedLayerName = this.props.options.drawingOrder[1]; // Remove the first element
    }
    else if (this.props?.options?.id === "indian_dhows_distance_from_pakcoast_final.qgz") {
        updatedLayerName = ['Style_1','Style_2']; // Remove the first element
    }
    else if (this.props?.options?.id === "all_vessels_fishing_density_areas_in_pak.qgz") {
      updatedLayerName = ['eez_density','ecs_density']; // Remove the first element
    }
    else {
      // retain the layerName as a single value
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
      dtg: "",
      name: "",
      date: "",
      layerName: "",
      ssr_country: "all",
      ssr_boat_name: "",
      ssr_own_ship: "",	
      ssr_no_of_crew: "",
      ssr_boat_regno: "",
      ssr_dtg: "",
      vessel_id: "",
      vessel_ssvid: "",
      vessel_flag: "all",
      ais_type_summary: "",
      timestamp: "",
      destination: "",
      current_port: "",
      begin: "",
      end: "",
      start: "",
      end2: "",
      date_all_flag_heatmap: "",
      date_new: "",
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
                    {/* <Form.Item label="Select Date">
                      <DatePicker onChange={(value) => this.handleChange("dtg", value)} format={'DD/MM/YYYY'} 
                        value={this.state.dtg} className="date-picker-custom"/>
                    </Form.Item> */}
                    <Form.Item label="Select Date">
                      <RangePicker
                        onChange={(value) => this.handleChange("dtg", value)}
                        value={this.state.dtg}
                        format="DD-MM-YYYY" className="date-picker-custom"
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
                    {/* <Form.Item label="Search Boat">
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
                    </Form.Item> */}
                    <Form.Item label="Select Date">
                      <RangePicker
                        onChange={(value) => this.handleChange("ssr_dtg", value)}
                        value={this.state.ssr_dtg}
                        format="DD-MM-YYYY" className="date-picker-custom"
                      />
                      {/* <DatePicker onChange={(value) => this.handleChange("ssr_dtg", value)} format={'DD/MM/YYYY'} value={this.state.ssr_dtg} className="date-picker-custom"/> */}
                    </Form.Item>
                    <Form.Item>
                      <Button onClick={this.handleClear} type="default">
                          Clear Filters
                      </Button>
                    </Form.Item>
                  </>
                )}         
                {
                this.props?.options?.id === "ais_merchant_vessels_heatmap.qgz" && (
                  <>
                    <Form.Item label="Select Date">
                      <RangePicker
                        onChange={(value) => this.handleChange("timestamp", value)}
                        value={this.state.timestamp}
                        // value={this.state.timestamp.map(date => dayjs(date))}
                        format="DD-MM-YYYY" className="date-picker-custom"
                      />
                    </Form.Item>
                    {/* <Form.Item label="Select Date">
                      <DatePicker onChange={(value) => this.handleChange("date", value)} format={'DD/MM/YYYY'} className="date-picker-custom"/>
                    </Form.Item> */}
                    {/*Flag Dropdown */ }
                    <Form.Item label="Flag">
                        <Select
                            // showSearch
                            // optionFilterProp="children"
                            placeholder="Select Flag"
                            value={this.state.flag}
                            onChange={(value) => this.handleChange("flag", value)}
                            style={{width: "100px"}}
                        >
                          <Option value="all">All</Option>
                          <Option value="GB">United Kingdom</Option>
                          <Option value="MH">Marshall Islands</Option>
                          <Option value="GR">Greece</Option>
                          <Option value="PA">Panama</Option>
                          <Option value="IN">India</Option>
                          <Option value="SG">Singapore</Option>
                          <Option value="MT">Malta</Option>
                          <Option value="KN">Saint Kitts and Nevis</Option>
                          <Option value="PK">Pakistan</Option>
                          <Option value="KR">South Korea</Option>
                          <Option value="NU">Niue</Option>
                          <Option value="PT">Portugal</Option>
                          <Option value="LR">Liberia</Option>
                          <Option value="HK">Hong Kong</Option>
                          <Option value="TR">Turkey</Option>
                          <Option value="CN">China</Option>
                          <Option value="VC">Saint Vincent and the Grenadines</Option>
                          <Option value="TZ">Tanzania</Option>
                          <Option value="STATeless">Stateless</Option>
                          <Option value="CK">Cook Islands</Option>
                          <Option value="OM">Oman</Option>
                          <Option value="JP">Japan</Option>
                          <Option value="DK">Denmark</Option>
                          <Option value="BS">Bahamas</Option>
                          <Option value="IR">Iran</Option>
                          <Option value="FR">France</Option>
                          <Option value="MN">Mongolia</Option>
                          <Option value="NR">Nauru</Option>
                          <Option value="PW">Palau</Option>
                          <Option value="GA">Gabon</Option>
                          <Option value="KM">Comoros</Option>
                          <Option value="CY">Cyprus</Option>
                          <Option value="GW">Guinea-Bissau</Option>
                          <Option value="NO">Norway</Option>
                          <Option value="AG">Antigua and Barbuda</Option>
                          <Option value="BZ">Belize</Option>
                          <Option value="RU">Russia</Option>
                          <Option value="AE">United Arab Emirates</Option>
                          <Option value="VN">Vietnam</Option>
                          <Option value="SA">Saudi Arabia</Option>
                          <Option value="BE">Belgium</Option>
                          <Option value="BD">Bangladesh</Option>
                          <Option value="CW">Curaçao</Option>
                          <Option value="MY">Malaysia</Option>
                          <Option value="TV">Tuvalu</Option>
                          <Option value="ET">Ethiopia</Option>
                          <Option value="US">United States</Option>
                          <Option value="DE">Germany</Option>
                          <Option value="BB">Barbados</Option>
                          <Option value="NL">Netherlands</Option>
                          <Option value="IT">Italy</Option>
                          <Option value="KW">Kuwait</Option>
                          <Option value="ID">Indonesia</Option>
                          <Option value="CM">Cameroon</Option>
                          <Option value="KY">Cayman Islands</Option>
                          <Option value="PH">Philippines</Option>
                          <Option value="LU">Luxembourg</Option>
                          <Option value="HN">Honduras</Option>
                          <Option value="VU">Vanuatu</Option>
                          <Option value="GY">Guyana</Option>
                          <Option value="TG">Togo</Option>
                          <Option value="ES">Spain</Option>
                        </Select>
                      </Form.Item>
                    {/*Type Dropdown */ }
                    <Form.Item label="Type">
                      <Select
                        // showSearch
                        placeholder="Select Type"
                        value={this.state.ais_type_summary}
                        onChange={(value) => this.handleChange("ais_type_summary", value)}
                        style={{width: "100%"}}
                      >
                        <Option value="">All</Option>
                        <Option value="Tanker">Tanker</Option>
                        <Option value="Cargo">Cargo</Option>
                        <Option value="Other">Other</Option>
                        <Option value="Special Craft">Special Craft</Option>
                        <Option value="Tug">Tug</Option>
                        <Option value="UNSPECIFIED">Unspecified</Option>
                        <Option value="Fishing">Fishing</Option>
                        <Option value="Wing in Grnd">Wing in Ground</Option>
                        <Option value="Unspecified">Unspecified</Option>
                        <Option value="VTS">VTS</Option>
                        <Option value="Search and Rescue">Search and Rescue</Option>
                        <Option value="Pleasure Craft">Pleasure Craft</Option>
                        <Option value="Sailing Vessel">Sailing Vessel</Option>
                        <Option value="Navigation Aid">Navigation Aid</Option>
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
                {
                this.props?.options?.id === "fishingheatmap.qgz" && (
                  <>
                    <Form.Item label="Select Date">
                      <RangePicker
                        onChange={(value) => this.handleChange("date", value)}
                        value={this.state.date}
                        format="DD-MM-YYYY" className="date-picker-custom"
                      />
                    </Form.Item>
                    {/* <Form.Item label="Select Date">
                      <DatePicker onChange={(value) => this.handleChange("date", value)} 
                        value={this.state.date} format={'DD/MM/YYYY'} className="date-picker-custom"/>
                    </Form.Item> */}
                    <Form.Item>
                      <Button onClick={this.handleClear} type="default">
                          Clear Filters
                      </Button>
                    </Form.Item>
                  </>
                )
                }
                {
                this.props?.options?.id === "pak_fishing_density_areas.qgz" && (
                  <>
                    {/* Date Range */}
                    <Form.Item label="Select Date">
                      <RangePicker
                        onChange={(value) => this.handleChange("date", value)}
                        value={this.state.date}
                        format="DD-MM-YYYY" className="date-picker-custom"
                      />
                    </Form.Item>
                    {/*Type Dropdown */ }
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
                    {/* <Form.Item label="Search Vessel">
                    <Input
                        placeholder="Enter Vessel Name"
                        value={this.state.name}
                        onChange={(e) => this.handleChange("name", e.target.value)}
                    />
                    </Form.Item> */}
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
                    {/* <Form.Item label="Search Vessel">
                    <Input
                        placeholder="Enter Vessel Name"
                        value={this.state.vessel_name}
                        onChange={(e) => this.handleChange("vessel_name", e.target.value)}
                    />
                    </Form.Item>                   */}
                    {/* Vessel ID Search */}
                    {/* <Form.Item label="Search Vessel ID">
                    <Input
                        placeholder="Enter Vessel ID"
                        value={this.state.vessel_id}
                        onChange={(e) => this.handleChange("vessel_id", e.target.value)}
                    />
                    </Form.Item>                   */}
                    {/* Vessel SSVID Search */}
                    {/* <Form.Item label="Search Vessel SSVID">
                    <Input
                        placeholder="Enter Vessel SSVID"
                        value={this.state.vessel_ssvid}
                        onChange={(e) => this.handleChange("vessel_ssvid", e.target.value)}
                    />
                    </Form.Item> */}
                    {/* Date range */}
                    <Form.Item label="Select Date">
                      <RangePicker
                        onChange={(value) => this.handleChange("date_all_flag_heatmap", value)}
                        value={this.state.date_all_flag_heatmap}
                        format="DD-MM-YYYY" className="date-picker-custom"
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
                {this.props?.options?.id === "indian_dhows_distance_from_pakcoast_final.qgz" && 
                (
                  <>
                    <Form.Item label="Select Date">
                      <RangePicker
                        onChange={(value) => this.handleChange("date", value)}
                        value={this.state.date}
                        format="DD-MM-YYYY" className="date-picker-custom"
                      />
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
                )}     
                {
                this.props?.options?.id === "indian_dhows_routes.qgz" && (
                  <>
                    <Form.Item label="Select Date">
                      <RangePicker
                        onChange={(value) => this.handleChange("date_new", value)}
                        value={this.state.date_new}
                        format="DD-MM-YYYY" className="date-picker-custom"
                      />
                    </Form.Item>
                    {/* <Form.Item label="Select Begin Date">
                      <DatePicker onChange={(value) => this.handleChange("begin", value)} 
                        value={this.state.begin} format={'DD/MM/YYYY'} className="date-picker-custom"/>
                    </Form.Item>
                    <Form.Item label="Select End Date">
                      <DatePicker onChange={(value) => this.handleChange("end", value)} 
                        value={this.state.end} format={'DD/MM/YYYY'} className="date-picker-custom"/>
                    </Form.Item>
                    <Form.Item label="Select Date">
                      <DatePicker onChange={(value) => this.handleChange("date", value)} 
                        value={this.state.date} format={'DD/MM/YYYY'} className="date-picker-custom"/>
                    </Form.Item> */}
                    <Form.Item>
                      <Button onClick={this.handleClear} type="default">
                          Clear Filters
                      </Button>
                    </Form.Item>
                  </>
                )
                }
                
                {/* reset/clear filters */}
                {/* { 1 && ( */}
                {/* {console.log(this.is_filter)} */}
                  {/* <Form.Item>
                    <Button onClick={this.handleClear} type="default">
                        Clear Filters
                    </Button>
                  </Form.Item> */}
                {/* )} */}
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
