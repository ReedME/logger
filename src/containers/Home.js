import React, { Component } from "react";
import { PageHeader, ListGroup, ListGroupItem } from "react-bootstrap";
import { API } from "aws-amplify";
import "./Home.css";

export default class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: true,
            dockets: []
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

    renderDocketsList(dockets) {
        return [{}].concat(dockets).map(
            (docket, i) =>
                i !== 0
                    ? <ListGroupItem
                        key={docket.docketId}
                        href={`/dockets/${docket.docketId}`}
                        onClick={this.handleDocketClick}
                        header={docket.content.trim().split("\n")[0]}
                    >
                        {"Created: " + new Date(docket.createdAt).toLocaleString()}
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