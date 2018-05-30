import React, { Component } from "react";
import { Badge, PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import { API } from "aws-amplify";
import moment from "moment";
import "./Home.css";


export default class Home extends Component {
 constructor(props) {
  super(props);

  this.state = {
   isLoading: true,
   dockets: [],
   weekHours: 0
  };
 }

 async componentDidMount() {
  if (!this.props.isAuthenticated) {
   return;
  }
    
  try {
   const dockets = await this.dockets();
   this.setState({ dockets });
  } catch (e) {
   alert(e);
  }
    
  this.setState({ isLoading: false });
 }
    
 dockets() {
  return API.get("dockets", "/dockets");
 }

 colourListItem(approvalParam){
     
  if(approvalParam === "approved"){
   return "success";
  } else if(approvalParam === "pending"){
   return "info";
  } else if(approvalParam === "requires clarification"){
   return "warning";
  } else {
   return "danger";
  }
 }

 renderDocketsList(dockets) {
  return [{}].concat(dockets).map(
   (docket, i) =>
    i !== 0
     ?
     
     <ListGroupItem
      key={docket.docketId}
      href={`/dockets/${docket.docketId}`}
      onClick={this.handleDocketClick}
      // eslint-disable-next-line
      header={"Docket #" + docket.docketIdNum.trim().split("\n")[0]+" - "+"Status: " + (docket.approval).toLocaleUpperCase() +" - " + docket.workHours + " hours"}
      bsStyle={this.colourListItem(docket.approval)}
     >
      
      {"Entered: " + moment(docket.createdAt).format("DD/MM/YYYY, HH:mm")}
     </ListGroupItem>
     : null
  );
 }
 

 renderDocketsListWeek(dockets) {
     
  var docketsShort = [{}].concat(dockets).filter(function (dockets){
   
   return moment(dockets.startDate) > moment().day(-1) && moment(dockets.startDate) < moment().day(7);
   
  }); 
  
  
    
    
    
  return docketsShort.map(
   (docket, i) =>
    
    i !== 0
     ?
      
     <ListGroupItem
      key={docket.docketId}
      href={`/dockets/${docket.docketId}`}
      onClick={this.handleDocketClick}
      // eslint-disable-next-line
        header={"Docket #" + docket.docketIdNum+" - "+"Status: " + (docket.approval).toLocaleUpperCase() +" - " + docket.workHours + " hours"}
      bsStyle={this.colourListItem(docket.approval)}
     >
      
      {"Entered: " + moment(docket.createdAt).format("DD/MM/YYYY, HH:mm")}
     </ListGroupItem>
     : <ListGroupItem
      key="new"
      href="/dockets/new"
      onClick={this.handleDocketClick}
     >
      <h4>
       <b>{"\uFF0B"}</b> Create a new docket
      </h4>
     </ListGroupItem>
  );
 }
    
    handledocketClick = event => {
     event.preventDefault();
     this.props.history.push(event.currentTarget.getAttribute("href"));
    }

    calclulateWeek(){
     var docketsCalc = this.state.dockets;
     var weekCalc = 0;
     var docketsShort = [{}].concat(docketsCalc).filter(function (docketsCalc){
      
      return moment(docketsCalc.startDate) > moment().day(-1) && moment(docketsCalc.startDate) < moment().day(7);
        
     }); 
       
     docketsShort.map((docket, i) =>
      i !== 0
       ? weekCalc=weekCalc+docket.workHours
       : null);
        
     return weekCalc;

    } 
       
       
         
     
           
    

    renderLander() {
     return (
      <div className="lander">
       <h1>Docket Logger</h1>
       <p>A simple docket logging app.</p>
      </div>
     );
    }

    renderDockets() {
     return (
      <div className="dockets">
       <PageHeader>Your Dockets</PageHeader>
       <PageHeader><small>This Week</small><Badge pullRight>{this.calclulateWeek()+" "}hours this week</Badge></PageHeader>
       <ListGroup>
        {!this.state.isLoading && this.renderDocketsListWeek(this.state.dockets)}
       </ListGroup>
       <PageHeader><small>All Dockets</small></PageHeader>
       <ListGroup>
        {!this.state.isLoading && this.renderDocketsList(this.state.dockets)}
       </ListGroup>
      </div>
     );
    }

    render() {
     return (
      <div className="Home">
       {this.props.isAuthenticated ? this.renderDockets() : this.renderLander()}
      </div>
     );
    }
}