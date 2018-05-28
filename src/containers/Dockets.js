import React, { Component } from "react";
import { API, Storage } from "aws-amplify";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import config from "../config/config";
import "./Dockets.css";
import { s3Upload, s3Delete } from "../libs/awsLib";

export default class Dockets extends Component {
 constructor(props) {
  super(props);

  this.file = null;

  this.state = {
   isLoading: null,
   isDeleting: null,
   docket: null,
   docketIdNum: "",
   attachmentURL: null
  };
 }

 async componentDidMount() {
  try {
   let attachmentURL;
   const docket = await this.getDocket();
   const { docketIdNum, attachment } = docket;

   if (attachment) {
    attachmentURL = await Storage.get(attachment);
   }

   this.setState({
    docket,
    docketIdNum,
    attachmentURL
   });
  } catch (e) {
   alert(e);
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
      
      handleChange = event => {
       this.setState({
        [event.target.id]: event.target.value
       });
      }
      
      handleFileChange = event => {
       this.file = event.target.files[0];
      }
      
      saveDocket(docket) {
       return API.put("dockets", `/dockets/${this.props.match.params.id}`, {
        body: docket
       });
      }
      
      handleSubmit = async event => {
       let attachment;
      
       event.preventDefault();
      
       if (this.file && this.file.size > config.MAX_ATTACHMENT_SIZE) {
        alert("Please pick a file smaller than 5MB");
        return;
       }
      
       this.setState({ isLoading: true });
      
       try {
        if (this.file) {
         attachment = await s3Upload(this.file);
        }
      
        await this.saveDocket({
         docketIdNum: this.state.docketIdNum,
         attachment: attachment || this.state.docket.attachment
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
        const { attachment } = docket;
        await s3Delete(attachment);
        await this.deleteDocket();
              
        this.props.history.push("/");
       } catch (e) {
        alert(e);
        this.setState({ isDeleting: false });
       }
      }
      
      render() {
       return (
        <div className="dockets">
         {this.state.docket &&
              <form onSubmit={this.handleSubmit}>
               <FormGroup controlId="docketIdNum">
                <FormControl
                 onChange={this.handleChange}
                 value={this.state.docketIdNum}
                 componentClass="textarea"
                />
               </FormGroup>
               {this.state.docket.attachment &&
                  <FormGroup>
                   <ControlLabel>Attachment</ControlLabel>
                   <FormControl.Static>
                    <a
                     target="_blank"
                     rel="noopener noreferrer"
                     href={this.state.attachmentURL}
                    >
                     {this.formatFilename(this.state.docket.attachment)}
                    </a>
                   </FormControl.Static>
                  </FormGroup>}
               <FormGroup controlId="file">
                {!this.state.docket.attachment &&
                    <ControlLabel>Attachment</ControlLabel>}
                <FormControl onChange={this.handleFileChange} type="file" />
               </FormGroup>
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
              </form>}
        </div>
       );
      }
}