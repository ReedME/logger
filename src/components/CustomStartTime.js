import React from "react";
import { Button } from "react-bootstrap";
import PropTypes from "prop-types";

class CustomStartTime extends React.Component {

    render () {
        return (
            <Button
                className="test"
                onClick={this.props.onClick}>
                {this.props.value}
            </Button>
        );
    }
}
  
CustomStartTime.propTypes = {
    onClick: PropTypes.func,
    value: PropTypes.string
};

export default CustomStartTime;