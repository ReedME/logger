import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel,  Label } from "react-bootstrap";
import DatePicker from "react-datepicker";
import moment from "moment";
import LoaderButton from "../components/LoaderButton";
import config from "../config/config";
import { API } from "aws-amplify";
import { s3Upload } from "../libs/awsLib";

import "react-datepicker/dist/react-datepicker.css";
import "./NewDocket.css";
import CustomStartTime from "../components/CustomStartTime";


export default class NewDocket extends Component {
    constructor(props) {
        super(props);

        this.file = null;

        this.state = {
            hours: null,
            startDate: moment(),
            endDate: moment(),
            isLoading: null,
            docketIdNum: 0,
            rego: "",
            break: 0,
            workHours: 0
            
        };
        this.handleStartChange = this.handleStartChange.bind(this);
        this.handleFinishChange = this.handleFinishChange.bind(this);
    }
    handleStartChange(date) {
        this.setState({
            startDate: date
        });
    }
    handleFinishChange(date) {
        this.setState({
            endDate: date
        });
    }
 

    validateForm() {
        return this.state.rego.length > 5 &&
        this.state.rego.length < 7;
    }

  handleChange = event => {
      this.setState({
          [event.target.id]: event.target.value
      });
  }

  handleFileChange = event => {
      this.file = event.target.files[0];
  }

  handleSubmit = async event => {
      event.preventDefault();
      
      this.setState({
          workHours: (Math.round(this.state.endDate.diff(this.state.startDate, "hours", true)*100)/100)-this.state.break
      });
      

      
      if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
          alert("Please pick a file smaller than 5MB");
          return;
      }
  
      this.setState({ isLoading: true });
  
      try {
          await this.setState({
              workHours: (Math.round(this.state.endDate.diff(this.state.startDate, "hours", true)*100)/100)-this.state.break
          });
          
          const attachment = this.file
              ? await s3Upload(this.file)
              : null;
  
          await this.createDocket({
              attachment,
              rego: this.state.rego,
              docketIdNum: this.state.docketIdNum
              
          });
          this.props.history.push("/");
      } catch (e) {
          alert(e);
          this.setState({ isLoading: false });
      }
  }
  
  createDocket(docket) {
      console.log(this.state.workHours);
      return API.post("dockets", "/dockets", {
          body: docket
      });
  }

 
  render() {
      
      return (
          
          <div className="NewDocket">
              <form onSubmit={this.handleSubmit}>
                  <FormGroup controlId="docketIdNum">
                      <ControlLabel> Docket ID # </ControlLabel>
                      <FormControl
                          onChange={this.handleChange}
                          value={this.state.docketIdNum}
                          type="text"
                      />
                  </FormGroup>
                  <FormGroup controlId="rego">
                      <ControlLabel> Truck Registration # </ControlLabel>
                      <FormControl
                          onChange={this.handleChange}
                          value={this.state.rego}
                          type="text"
                      />
                  </FormGroup>
                  
                  <FormGroup controlId="startDate">
                      <ControlLabel> Your Start Time </ControlLabel>
                      <DatePicker 
                          customInput={<CustomStartTime />}
                          selected={this.state.startDate}
                          selectsStart
                          startDate={this.state.startDate}
                          endDate={this.state.endDate}
                          onChange={this.handleStartChange}
                          timeIntervals={15}
                          showTimeSelect
                          readOnly
                          dateFormat="LLL" />
                  </FormGroup>       


                          
                  <FormGroup controlId="endDate">
                      <ControlLabel> Your Finish Time </ControlLabel>
                      
                      <DatePicker
                          customInput={<CustomStartTime />}
                          selected={this.state.endDate}
                          selectsEnd
                          startDate={this.state.startDate}
                          endDate={this.state.endDate}
                          onChange={this.handleFinishChange}
                          timeIntervals={15}
                          showTimeSelect
                          readOnly
                          dateFormat="LLL"
                          
                      />
                  </FormGroup>
                  <FormGroup controlId="break">
                      <ControlLabel> Your Break</ControlLabel>
                      
                      <Label bsStyle="info">Enter as parts of an hour, eg. 30 minutes = 0.5 hours</Label>  
                      
                      <FormGroup controlId="break">
                          
                          <FormControl
                              onChange={this.handleChange}
                              value={this.state.break}
                              type="text"
                          />
                      </FormGroup>
                  </FormGroup>
                  <FormGroup controlId="file">
                      <ControlLabel>Attach photo of job docket</ControlLabel>
                      <FormControl onChange={this.handleFileChange} type="file" />
                  </FormGroup>
                  <LoaderButton
                      block
                      bsStyle="primary"
                      bsSize="large"
                      disabled={!this.validateForm()}
                      type="submit"
                      isLoading={this.state.isLoading}
                      text="Create"
                      loadingText="Creating…"
                  />
              </form>
          </div>
      );
  }
}