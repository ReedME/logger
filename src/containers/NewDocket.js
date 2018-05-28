import React, { Component } from "react";
import { 
 FormGroup, 
 FormControl, 
 ControlLabel,  
 Label, 
 Form, 
 Col, 
 ToggleButton, 
 ToggleButtonGroup 
} from "react-bootstrap";
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
  this.tipFile = null;
  this.jsaFile = null;
  this.prestartFile = null;

  this.state = {
   hours: null,
   startDate: moment(),
   endDate: moment(),
   isLoading: null,
   docketIdNum: 0,
   rego: "",
   break: 0,
   workHours: 0,
   didTip: "no",
   tipped: false,
   tipLocation: "",
   tipDocketId: 0,
   tipQuantity: 0,
   didJSA: "no",
   didPrestart: "no",
   jsa: false,
   prestart: false
   
            
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

handleTipRadioChange = event => {
 this.setState({ didTip: event });
 if (event === "yes"){
  this.setState({
   tipped: true
  });
 } else {
  this.setState({
   tipped: false
  });
 }
}
 handlePrestartRadioChange = event => {
  this.setState({ didPrestart: event });
  if (event === "yes"){
   this.setState({
    prestart: true
   });
  } else {
   this.setState({
    prestart: false
   });
  }
 }

    handleJSARadioChange = event => {
     this.setState({ didJSA: event });
     if (event === "yes"){
      this.setState({
       jsa: true
      });
     } else {
      this.setState({
       jsa: false
      });
     }
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
      
   return API.post("dockets", "/dockets", {
    body: docket
   });
  }

 
  render() {
   
   return (
          
    <div className="NewDocket">
     
     
     <Form horizontal onSubmit={this.handleSubmit}>
       
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
       <Label bsStyle="info" className="pull-right">
       Requires full 6 digits
       </Label>
       <FormControl
        onChange={this.handleChange}
        value={this.state.rego}
        type="text"
       />
      </FormGroup>
       
      <FormGroup controlId="client">
       <ControlLabel> Client Name </ControlLabel>
       <Label className="pull-right" bsStyle="info">Please ensure this matches the client on Job Email</Label>  
                       
       <FormControl
        onChange={this.handleChange}
        value={this.state.client}
        type="text"
       />
      </FormGroup>
       
      <FormGroup controlId="jobAddress">
       <ControlLabel> Job Address </ControlLabel>
       <FormControl
        onChange={this.handleChange}
        value={this.state.jobAddress}
        type="text"
       />
      </FormGroup>
      <FormGroup controlId="Date">
       <Col>
       
        <ControlLabel> Your Start Time </ControlLabel>
        <Label bsStyle="info" className="pull-right">
       This is your 'Operator' start time
        </Label>
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
              
       </Col>
       <Col>

                          
       
        <ControlLabel> Your Finish Time </ControlLabel>
        <Label bsStyle="info" className="pull-right">
       This is your 'Operator' finish time
        </Label>              
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
      
       </Col>
      </FormGroup>
      <FormGroup controlId="break">
       <ControlLabel> Your Break</ControlLabel>
                      
       <Label bsStyle="info" className="pull-right">Enter as parts of an hour, eg. 30 minutes = 0.5 hours</Label>  
                      
                         
       <FormControl
        onChange={this.handleChange}
        value={this.state.break}
        type="number"
       />
      </FormGroup>
      <FormGroup>
       <ControlLabel> Did you tip?</ControlLabel>
                      
       <Label bsStyle="info" className="pull-right">If yes, please fill out below</Label>  
      </FormGroup>
      <FormGroup>             
       <ToggleButtonGroup 
        name="tipOptions" 
        type="radio" 
        defaultValue="no" 
        onChange={this.handleTipRadioChange}
        className="returnMargin">
        <ToggleButton value="no"> No </ToggleButton>
        <ToggleButton value="yes"> Yes </ToggleButton>
        <ToggleButton value="onsite"> Onsite </ToggleButton>
       </ToggleButtonGroup>                  
      </FormGroup>
      { this.state.tipped ?    
       <div>
        <FormGroup controlId="tipLocation">
         <ControlLabel> Where did you tip? </ControlLabel>
         <FormControl
          onChange={this.handleChange}
          value={this.state.tipLocation}
          type="text"                           
          readOnly={!this.state.tipped}
         />
        </FormGroup>
        <FormGroup controlId="tipDocketId">
         <ControlLabel> What is tip Docket number? </ControlLabel>
         <FormControl
          onChange={this.handleChange}
          value={this.state.tipDocketId}
          type="number"
          readOnly={!this.state.tipped}
         />
        </FormGroup>
        <FormGroup controlId="tipQuantity">
         <ControlLabel> What was tip weight? </ControlLabel>
         <Label bsStyle="info" className="pull-right">
       In tonnes
         </Label>  
        
         <FormControl
          onChange={this.handleChange}
          value={this.state.tipQuantity}
          type="number"
          readOnly={!this.state.tipped}
         />
        </FormGroup>
       </div>
       : null
      }
      <FormGroup>
       <ControlLabel> Did you do a Prestart?</ControlLabel>
                      
       <Label bsStyle="info" className="pull-right">If yes, please upload a copy</Label>  
      </FormGroup>
      <FormGroup>             
       <ToggleButtonGroup 
        name="prestartOptions" 
        type="radio" 
        defaultValue="no" 
        onChange={this.handlePrestartRadioChange}
        className="returnMargin">
        <ToggleButton value="no"> No </ToggleButton>
        <ToggleButton value="yes"> Yes </ToggleButton>
       </ToggleButtonGroup>                  
      </FormGroup>
      <FormGroup>
       <ControlLabel> Did you do a JSA?</ControlLabel>
                      
       <Label bsStyle="info" className="pull-right">If yes, please upload a copy</Label>  
      </FormGroup>
      <FormGroup>             
       <ToggleButtonGroup 
        name="jsaOptions" 
        type="radio" 
        defaultValue="no" 
        onChange={this.handleJSARadioChange}
        className="returnMargin">
        <ToggleButton value="no"> No </ToggleButton>
        <ToggleButton value="yes"> Yes </ToggleButton>
       </ToggleButtonGroup>                  
      </FormGroup>
       
      <FormGroup controlId="comment">
       <ControlLabel> Comments </ControlLabel>
       <Label bsStyle="info" className="pull-right">Add any comments, related to this docket</Label>  
     
       <FormControl
        onChange={this.handleChange}
        value={this.state.comments}
        type="text"
        placeholder="This area is useful for detailing tasks related to docket"
        componentClass="textarea"
       />
      </FormGroup>

      <FormGroup controlId="file">
       <ControlLabel>Attach photo of job docket</ControlLabel>
       <Label bsStyle="info" className="pull-right">
       Please ensure photo is clear, with adequate light before submitting
       </Label> 
       <FormControl onChange={this.handleFileChange} type="file" />
      </FormGroup>
      { this.state.tipped ?    
       <div>
        <FormGroup controlId="tipfile">
         <ControlLabel>Attach photo of tip dockets</ControlLabel>
         <Label bsStyle="info" className="pull-right">
       Place all relevant dockets in one image
         </Label> 
         <FormControl disabled={!this.state.tipped} onChange={this.handleFileChange} type="file" />
        </FormGroup>
       </div>
       : null
      }
      { this.state.prestart ?
       <div>
        <FormGroup controlId="prestartfile">
         <ControlLabel>Attach photo of Pre-start</ControlLabel>
         <Label bsStyle="info" className="pull-right">
       Required once per day if taking a truck out
         </Label> 
         <FormControl onChange={this.handleFileChange} type="file" />
        </FormGroup>
       </div>
       : null
      }
      { this.state.jsa ?
       <div>
        <FormGroup controlId="jsafile">
         <ControlLabel>Attach photo of completed JSA</ControlLabel>
         <Label bsStyle="info" className="pull-right">
       Required per job, unless signed onto another persons.
         </Label> 
         <FormControl onChange={this.handleFileChange} type="file" />
        </FormGroup>
       </div>
       : null
      } 
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
     </Form>
    </div>
   );
  }
}