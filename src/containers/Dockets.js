import React, { Component } from "react";
import { API, Storage } from "aws-amplify";
import { Glyphicon, Alert, FormGroup, FormControl, ControlLabel, Form, Label, Col, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import config from "../config/config";
import "./Dockets.css";
import moment from "moment";
import DatePicker from "react-datepicker";
import { s3Upload, s3Delete } from "../libs/awsLib";
import "react-datepicker/dist/react-datepicker.css";
import "./NewDocket.css";
import CustomStartTime from "../components/CustomStartTime";

export default class Dockets extends Component {
 constructor(props) {
  super(props);

  this.file = null;

  this.state = {
   isLoading: null,
   isDeleting: null,
   docket: null,
   docketIdNum: "",
   docketAttachmentURL: null,
   prestartAttachmentURL: null,
   jsaAttachmentURL: null,
   tipAttachmentURL: null,
   rego: "",
   workHours: 0,
   startDate: this.nearestFutureMinutes(15, moment()),
   endDate: this.nearestFutureMinutes(15, moment()),
   jobBreak: "",
   didTip: "",
   tipLocation: "",
   tipDocketId: 0,
   tipQuantity: 0,
   didJSA: "",
   didPrestart: "",
   comment: "",
   employeeId: 0,
   clientName: "",
   jobAddress: "",
   tipped: false,
   jsa: false,
   prestart: false,
   approval: "",
   isAdmin: false,
   isLocked: "This page can only be edited by a Manager",
   lockGlyph: "lock",
   adminTest: "admin"
   
  };
  this.handleStartChange = this.handleStartChange.bind(this);
  this.handleFinishChange = this.handleFinishChange.bind(this);
 }

 toggleLocked(){
  if(this.state.isAdmin){
   
   return "success";
  } else {
   
   return "warning";
  }
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
 nearestFutureMinutes(interval, someMoment){
  const roundedMinutes = Math.ceil(someMoment.minute() / interval) * interval;
  return someMoment.clone().minute(roundedMinutes).second(0);
 }
 async componentDidMount() {
  this.checkAdminLevel();
  
  try {
   let docketAttachmentURL;
   let prestartAttachmentURL;
   let jsaAttachmentURL;
   let tipAttachmentURL;
   const docket = await this.getDocket();
   const { 
    // add stuff to pull out of docket here to store into the state object?
    docketIdNum, 
    docketAttachment,
    prestartAttachment,
    jsaAttachment,
    tipAttachment,
    rego,
    workHours,
    startDate,
    endDate,
    jobBreak,
    didTip,
    tipLocation,
    tipDocketId,
    tipQuantity,
    didJSA,
    didPrestart,
    comment,
    employeeId,
    clientName,
    jobAddress,
    approval,
    offsiderId 
   } = docket;

   if (docketAttachment) {
    docketAttachmentURL = await Storage.get(docketAttachment);
   }
   if (prestartAttachment) {
    prestartAttachmentURL = await Storage.get(prestartAttachment);
   }
   if (jsaAttachment) {
    jsaAttachmentURL = await Storage.get(jsaAttachment);
   }
   if (tipAttachment) {
    tipAttachmentURL = await Storage.get(tipAttachment);
   }
   if (didTip === "yes"){
    this.setState({
     tipped: true
    });
   } else {
    this.setState({
     tipped: false
    });
   }


   if (didPrestart === "yes"){
    this.setState({
     prestart: true
    });
   } else {
    this.setState({
     prestart: false
    });
   }
   if (didJSA === "yes"){
    this.setState({
     jsa: true
    });
   } else {
    this.setState({
     jsa: false
    });
   }
      

   this.setState({
    docket,
    docketIdNum,
    docketAttachmentURL,
    prestartAttachmentURL,
    jsaAttachmentURL,
    tipAttachmentURL,
    rego,
    workHours,
    startDate: moment(startDate),
    endDate: moment(endDate),
    jobBreak,
    didTip,
    tipLocation,
    tipDocketId,
    tipQuantity,
    didJSA,
    didPrestart,
    comment,
    employeeId,
    clientName,
    jobAddress,
    approval,
    offsiderId 
   });
  } catch (e) {
   alert(e);
  }
 }

 checkAdminLevel(){
  if(this.state.adminTest === "admin"){
   this.setState({
    isAdmin: true
      
   });
  } else {
   this.setState({
    isAdmin: false
        
   });
  }
 }

 getDocket() {
  return API.get("dockets", `/dockets/${this.props.match.params.id}`);
 }

 validateForm() {
  return this.state.docketIdNum.length > 0;
 }
      
 formatFilename(str) {
  return str.replace(/^\w+-/, "");
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
      handleTipFileChange = event => {
       this.tipFile = event.target.files[0];
      }
        handleJSAFileChange = event => {
         this.jsaFile = event.target.files[0];
        }
        handlePrestartFileChange = event => {
         this.prestartFile = event.target.files[0];
        }
      
        saveDocket(docket) {
         return API.put("dockets", `/dockets/${this.props.match.params.id}`, {
          body: docket
         });
        }
      
      handleSubmit = async event => {
       event.preventDefault();
           
       this.setState({
        workHours: (Math.round(this.state.endDate.diff(this.state.startDate, "hours", true)*100)/100)-this.state.jobBreak
       });
           
     
           
       if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
        alert("Please pick a file smaller than 5MB");
        return;
       }
       
       this.setState({ isLoading: true });
       
       try {
        await this.setState({
         workHours: (Math.round(this.state.endDate.diff(this.state.startDate, "hours", true)*100)/100)-this.state.jobBreak
        });
               
        const docketAttachment = this.file
         ? await s3Upload(this.file)
         : null;
        const prestartAttachment = this.prestartFile
         ? await s3Upload(this.prestartFile)
         : null;
        const jsaAttachment = this.jsaFile
         ? await s3Upload(this.jsaFile)
         : null;
        const tipAttachment = this.tipFile
         ? await s3Upload(this.tipFile)
         : null;
       
        await this.saveDocket({
         docketAttachment,
         prestartAttachment,
         jsaAttachment,
         tipAttachment,
         rego: this.state.rego,
         docketIdNum: this.state.docketIdNum,
         workHours: this.state.workHours,
         startDate: this.state.startDate,
         endDate: this.state.endDate,
         break: this.state.jobBreak,
         didTip: this.state.didTip,
         tipLocation: this.state.tipLocation,
         tipDocketId: this.state.tipDocketId,
         tipQuantity: this.state.tipQuantity,
         didJSA: this.state.didJSA,
         didPrestart: this.state.didPrestart,
         comment: this.state.commment,
         clientName: this.state.clientName,
         jobAddress: this.state.jobAddress,
         employeeId: this.state.operatorOne,
         offsiderId: this.state.operatorTwo 
         
     
          
     
        });
        this.props.history.push("/");
       } catch (e) {
        alert(e);
        this.setState({ isLoading: false });
       }
      }
      
      deleteDocket() {
       return API.del("dockets", `/dockets/${this.props.match.params.id}`);      
      }
      
      handleDelete = async event => {
       event.preventDefault();
      
       const confirmed = window.confirm(
        "Are you sure you want to delete this docket?"
       );
      
       if (!confirmed) {
        return;
       }
      
       this.setState({ isDeleting: true });
      
       try {
        const docket = await this.getDocket();
        const { docketAttachment, jsaAttachment, prestartAttachment, tipAttachment } = docket;
        await s3Delete(docketAttachment);
        await s3Delete(jsaAttachment);
        await s3Delete(prestartAttachment);
        await s3Delete(tipAttachment);
        await this.deleteDocket();
              
        this.props.history.push("/");
       } catch (e) {
        alert(e);
        this.setState({ isDeleting: false });
       }
      }
      colourListItem(){
       if(this.state.approval === "approved"){
        return "success";
       } else if(this.state.approval === "pending"){
        return "info";
       } else if(this.state.approval === "requires clarification"){
        return "warning";
       } else {
        return "danger";
       }
      }
      render() {
       return (
        <div className="dockets">
         {this.state.docket &&
              
     <Form className="formWrap" horizontal onSubmit={this.handleSubmit}>
      <Alert align="center" bsStyle={this.colourListItem()}>{this.state.workHours+" HOURS "+this.state.approval.toLocaleUpperCase()}</Alert>
      {!this.state.isAdmin ?
       <Alert align="center" bsStyle={this.toggleLocked()}><Glyphicon glyph={this.state.lockGlyph} />{" "+this.state.isLocked}</Alert>
       : null }
      <FormGroup controlId="docketIdNum">

       <ControlLabel> Docket ID # </ControlLabel>
       <FormControl
        onChange={this.handleChange}
        value={this.state.docketIdNum}
        type="text"
        readOnly={!this.state.isAdmin}
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
        readOnly={!this.state.isAdmin}
       />
      </FormGroup>
        
      <FormGroup controlId="client">
       <ControlLabel> Client Name </ControlLabel>
       <Label className="pull-right" bsStyle="info">Please ensure this matches the client on Job Email</Label>  
                        
       <FormControl
        onChange={this.handleChange}
        value={this.state.clientName}
        type="text"
        readOnly={!this.state.isAdmin}
       />
      </FormGroup>
        
      <FormGroup controlId="jobAddress">
       <ControlLabel> Job Address </ControlLabel>
       <FormControl
        onChange={this.handleChange}
        value={this.state.jobAddress}
        type="text"
        readOnly={!this.state.isAdmin}
       />
      </FormGroup>
      <FormGroup  controlId="Date">
       <Col sm={6} className="no-padding">
       
        <FormGroup className="boxFix" controlId="operatorOne">
         <ControlLabel> Operator ID # </ControlLabel>
         <FormControl
          onChange={this.handleChange}
          value={this.state.operatorOne}
          type="number"
          readOnly={!this.state.isAdmin}
         />
        </FormGroup>

        <ControlLabel> Docket Start Time </ControlLabel>
        <div className="labelBump">
         <Label bsStyle="info" className="pull-right">
       This is your start time
         </Label>
        </div>
        <DatePicker 
         customInput={<CustomStartTime />}
         placeholderText="Click to select Operator Finish Time"
         popperPlacement="top-end"
         selected={this.state.startDate}
         selectsStart
         startDate={this.state.startDate}
         endDate={this.state.endDate}
         onChange={this.handleStartChange}
         timeIntervals={15}
         showTimeSelect
         readOnly
         disabled={!this.state.isAdmin}
         dateFormat="LLL" 
         
        />
               
       </Col>
       <Col sm={6}>
        <FormGroup className="boxFix" controlId="operatorTwo">
         <ControlLabel> Offsider ID # </ControlLabel>
         <FormControl
          onChange={this.handleChange}
          value={this.state.operatorTwo}
          type="number"
          readOnly={!this.state.isAdmin}
         />
        </FormGroup>
                          
       
        <ControlLabel> Docket Finish Time </ControlLabel>
        <div className="labelBump">
         <Label bsStyle="info" className="pull-right">
       This is your finish time
         </Label>
        </div>          
        <DatePicker
         placeholderText="Click to select Operator Finish Time"
         popperPlacement="top-end"
         customInput={<CustomStartTime />}
         selected={this.state.endDate}
         selectsEnd
         startDate={this.state.startDate}
         endDate={this.state.endDate}
         onChange={this.handleFinishChange}
         timeIntervals={15}
         showTimeSelect
         readOnly
         disabled={!this.state.isAdmin}
         dateFormat="LLL"
                           
        />
       
       </Col>
      </FormGroup>
      <FormGroup controlId="jobBreak">
       <ControlLabel> Your Break</ControlLabel>
                       
       <Label bsStyle="info" className="pull-right">Enter as parts of an hour, eg. 30 minutes = 0.5 hours</Label>  
                       
                          
       <FormControl
        onChange={this.handleChange}
        value={this.state.jobBreak}
        type="number"
        readOnly={!this.state.isAdmin}
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
        defaultValue={this.state.didTip}
        onChange={this.handleTipRadioChange}
        disabled={!this.state.isAdmin}
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
          readOnly={!this.state.isAdmin}
         />
        </FormGroup>
        <FormGroup controlId="tipDocketId">
         <ControlLabel> What is tip Docket number? </ControlLabel>
         <FormControl
          onChange={this.handleChange}
          value={this.state.tipDocketId}
          type="number"
          readOnly={!this.state.isAdmin}
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
          readOnly={!this.state.isAdmin}
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
        className="returnMargin"
        disabled={!this.state.isAdmin}>
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
        className="returnMargin"
        disabled={!this.state.isAdmin}>
        <ToggleButton value="no"> No </ToggleButton>
        <ToggleButton value="yes"> Yes </ToggleButton>
       </ToggleButtonGroup>                  
      </FormGroup>
        
      <FormGroup controlId="comment">
       <ControlLabel> Comments </ControlLabel>
       <Label bsStyle="info" className="pull-right">Do not remove existing comments</Label>  
      
       <FormControl
        onChange={this.handleChange}
        value={this.state.comment}
        type="text"
        placeholder={this.state.comment}
        componentClass="textarea"
       />
      </FormGroup>
               
      {this.state.docket.docketAttachment &&
                  <FormGroup>
                   <ControlLabel>Job Docket</ControlLabel>
                   <FormControl.Static>
                    <a
                     target="_blank"
                     rel="noopener noreferrer"
                     href={this.state.docketAttachmentURL}
                    >
                     {this.formatFilename(this.state.docket.docketAttachment)}
                    </a>
                   </FormControl.Static>
                  </FormGroup>}
      <FormGroup controlId="file">
       {!this.state.docket.docketAttachment &&
                    <ControlLabel>Add Job Docket</ControlLabel>}
       <FormControl  onChange={this.handleFileChange} type="file" />
      </FormGroup>
      { this.state.tipped ? <div>
       {this.state.docket.tipAttachment &&
                  <FormGroup>
                   <ControlLabel>Tip Dockets</ControlLabel>
                   <FormControl.Static>
                    <a
                     target="_blank"
                     rel="noopener noreferrer"
                     href={this.state.tipAttachmentURL}
                    >
                     {this.formatFilename(this.state.docket.tipAttachment)}
                    </a>
                   </FormControl.Static>
                  </FormGroup>}
       <FormGroup controlId="tipfile">
        {!this.state.docket.tipAttachment &&
                    <ControlLabel>Add Tip Docket</ControlLabel>}
        <FormControl  onChange={this.handleTipFileChange} type="file" />
       </FormGroup>
      </div> : null }
      { this.state.jsa ? 
       <div>
        {this.state.docket.jsaAttachment &&
                  <FormGroup>
                   <ControlLabel>JSA Docket</ControlLabel>
                   <FormControl.Static>
                    <a
                     target="_blank"
                     rel="noopener noreferrer"
                     href={this.state.jsaAttachmentURL}
                    >
                     {this.formatFilename(this.state.docket.jsaAttachment)}
                    </a>
                   </FormControl.Static>
                  </FormGroup>}
        <FormGroup controlId="jsafile">
         {!this.state.docket.jsaAttachment &&
                    <ControlLabel>Add JSA Docket</ControlLabel>}
         <FormControl onChange={this.handleJSAFileChange} type="file" />
        </FormGroup>
       </div>
       : null }
      {this.state.prestart ?
       <div>
        {this.state.docket.prestartAttachment &&
                  <FormGroup>
                   <ControlLabel>Prestart Docket</ControlLabel>
                   <FormControl.Static>
                    <a
                     target="_blank"
                     rel="noopener noreferrer"
                     href={this.state.prestartAttachmentURL}
                    >
                     {this.formatFilename(this.state.docket.prestartAttachment)}
                    </a>
                   </FormControl.Static>
                  </FormGroup>}
        <FormGroup controlId="prestartfile">
         {!this.state.docket.prestartAttachment &&
                    <ControlLabel>Add Prestart Docket</ControlLabel>}
         <FormControl onChange={this.handlePrestartFileChange} type="file" />
        </FormGroup>
       </div>
       : null }
      <LoaderButton
       block
       bsStyle="primary"
       bsSize="large"
       disabled={!this.validateForm()}
       type="submit"
       isLoading={this.state.isLoading}
       text="Save"
       loadingText="Saving…"
      />
      <LoaderButton
       block
       bsStyle="danger"
       bsSize="large"
       isLoading={this.state.isDeleting}
       onClick={this.handleDelete}
       text="Delete"
       loadingText="Deleting…"
      />
     </Form>}
        </div>
       );
      }
}