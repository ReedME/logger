import React, { Component } from "react";
import {
    HelpBlock,
    FormGroup,
    FormControl,
    ControlLabel
} from "react-bootstrap";
import { Auth } from "aws-amplify";
import LoaderButton from "../components/LoaderButton";
import "./Signup.css";

export default class Signup extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            email: "",
            password: "",
            username: "",
            givenName: "",
            familyName: "",
            confirmPassword: "",
            confirmationCode: "",
            employeeId: "",
            address: "",
            phone: "",
            state: "",
            newUser: null
        };
    }

    validateForm() {
        return (
            this.state.username.length > 0 &&
      this.state.givenName.length > 0 &&
      this.state.familyName.length > 0 &&
      this.state.email.length > 0 &&
      this.state.password.length > 0 &&
      this.state.password === this.state.confirmPassword
        );
    }

    validateConfirmationForm() {
        return this.state.confirmationCode.length > 0;
    }

  handleChange = event => {
      this.setState({
          [event.target.id]: event.target.value
      });
  }

  handleSubmit = async event => {
      event.preventDefault();
  
      this.setState({ isLoading: true });
  
      try {
          const newUser = await Auth.signUp({
              username: this.state.username,
              password: this.state.password,
              attributes: {
                  email: this.state.email,
                  phone_number: this.state.phone,
                  address: this.state.address,
                  "custom:givenName": this.state.givenName,
                  "custom:familyName": this.state.familyName,
                  "custom:state": this.state.state
              }
          });
          this.setState({
              newUser
          });
      } catch (e) {
          alert(e.message);
      }
  
      this.setState({ isLoading: false });
  }
  
  handleConfirmationSubmit = async event => {
      event.preventDefault();
  
      this.setState({ isLoading: true });
  
      try {
          await Auth.confirmSignUp(this.state.username, this.state.confirmationCode);
          await Auth.signIn(this.state.username, this.state.password);
  
          this.props.userHasAuthenticated(true);
          this.props.history.push("/");
      } catch (e) {
          alert(e.message);
          this.setState({ isLoading: false });
      }
  }

  renderConfirmationForm() {
      return (
          <form onSubmit={this.handleConfirmationSubmit}>
              <FormGroup controlId="confirmationCode" bsSize="large">
                  <ControlLabel>Confirmation Code</ControlLabel>
                  <FormControl
                      autoFocus
                      type="tel"
                      value={this.state.confirmationCode}
                      onChange={this.handleChange}
                  />
                  <HelpBlock>Please check your email for the code.</HelpBlock>
              </FormGroup>
              <LoaderButton
                  block
                  bsSize="large"
                  disabled={!this.validateConfirmationForm()}
                  type="submit"
                  isLoading={this.state.isLoading}
                  text="Verify"
                  loadingText="Verifying…"
              />
          </form>
      );
  }

  renderForm() {
      return (
          <form onSubmit={this.handleSubmit}>
              <FormGroup controlId="email" bsSize="large">
                  <ControlLabel>Email</ControlLabel>
                  <FormControl
                      autoFocus
                      type="email"
                      value={this.state.email}
                      onChange={this.handleChange}
                  />
              </FormGroup>
              <FormGroup controlId="username" bsSize="large">
                  <ControlLabel>Employee ID #</ControlLabel>
                  <FormControl
                      value={this.state.username}
                      onChange={this.handleChange}
                      type="number"
                  />
              </FormGroup>
              <FormGroup controlId="givenName" bsSize="large">
                  <ControlLabel>First Name</ControlLabel>
                  <FormControl
                      value={this.state.givenName}
                      onChange={this.handleChange}
                      type="text"
                  />
              </FormGroup>
              <FormGroup controlId="familyName" bsSize="large">
                  <ControlLabel>Surname</ControlLabel>
                  <FormControl
                      value={this.state.familyName}
                      onChange={this.handleChange}
                      type="text"
                  />
              </FormGroup>
              <FormGroup controlId="phone" bsSize="large">
                  <ControlLabel>Phone Number</ControlLabel>
                  <FormControl
                      value={this.state.phone}
                      onChange={this.handleChange}
                      type="tel"
                  />
              </FormGroup>
              <FormGroup controlId="address" bsSize="large">
                  <ControlLabel>Address</ControlLabel>
                  <FormControl
                      value={this.state.address}
                      onChange={this.handleChange}
                      type="text"
                  />
              </FormGroup>
              <FormGroup controlId="state" bsSize="large">
                  <ControlLabel>Branch</ControlLabel>
                  <FormControl
                      value={this.state.state}
                      onChange={this.handleChange}
                      componentClass="select"
                      placeholder="select branch"
                  >
                      <option value="NSW"> NSW </option>
                      <option value="QLD"> QLD </option>
                      <option value="VIC"> VIC </option>
                  </FormControl>
              </FormGroup>
              <FormGroup controlId="password" bsSize="large">
                  <ControlLabel>Password</ControlLabel>
                  <FormControl
                      value={this.state.password}
                      onChange={this.handleChange}
                      type="password"
                  />
              </FormGroup>
              <FormGroup controlId="confirmPassword" bsSize="large">
                  <ControlLabel>Confirm Password</ControlLabel>
                  <FormControl
                      value={this.state.confirmPassword}
                      onChange={this.handleChange}
                      type="password"
                  />
              </FormGroup>
              
              <LoaderButton
                  block
                  bsSize="large"
                  disabled={!this.validateForm()}
                  type="submit"
                  isLoading={this.state.isLoading}
                  text="Signup"
                  loadingText="Signing up…"
              />
          </form>
      );
  }

  render() {
      return (
          <div className="Signup">
              {this.state.newUser === null
                  ? this.renderForm()
                  : this.renderConfirmationForm()}
          </div>
      );
  }
}