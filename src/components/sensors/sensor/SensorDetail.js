import React, { Component } from 'react';
import { Card, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import { Container } from 'react-grid-system'
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import SensorNodeCard from './SensorNodeCard';
import LocationForm from './LocationForm';

import { connect } from 'react-redux';
import { getSensor, deleteSensor, updateSensorLocation, updateSensorName, updateMeasurementName, addMeasurement, deleteMeasurement } from "../../../actions/actions.js"
import RaisedButton from 'material-ui/RaisedButton';
import sensorNodeImage from '../../../images/sensorNode.png';
import { browserHistory } from 'react-router'
import config from '../../../config';

class SensorDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalLocation: false,
    };
  }

  componentWillMount() {
    this.props.getSensor(this.props.params.sensorId);
    this.interval = setInterval(() => {this.props.getSensor(this.props.params.sensorId)}, config.delayRefresh);
  }
  
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  
  render() {
    let renderElement = <h1> Sensor view is being loaded... </h1>;
    console.log("sens:" + JSON.stringify(this.props.sensor))
    let sensor = this.props.sensor;
    if (sensor) {
      var position = (sensor.location? [sensor.location.latitude, sensor.location.longitude]: [12.238, -1.561]);
      console.log("pos:" + JSON.stringify(position))
      renderElement =
        <Container fluid={true}>
          <h1 className="page-title">
            <img src={sensorNodeImage} height="40"/>
            Sensor node
          </h1>
          <SensorNodeCard className="sensorNode"
                          sensor={sensor}
                          updateSensorName={this.props.updateSensorName}
                          deleteSensor={this.props.deleteSensor}
                          updateMeasurement={this.props.addMeasurement}
                          deleteMeasurement={this.props.deleteMeasurement}/>
          <Card className="sensorMap">
            <CardTitle>
              <h2 className="cardTitle"> Location </h2>
              <RaisedButton label="Change..." labelStyle={{height: '10px'}} className="topRightButton" primary={true} onTouchTap={()=>{this.setState({modalLocation: true})}}/>
              <LocationForm initialLocation={sensor.location} modalOpen={this.state.modalLocation} 
                            onSubmit={(l) => this.props.updateSensorLocation(sensor.id, l)} handleClose={() => this.setState({modalLocation: false})}/>
            </CardTitle>
            <CardMedia>
              <Map ref="map" center={position} zoom={5}>
                <TileLayer url='http://{s}.tile.osm.org/{z}/{x}/{y}.png' attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'/>
                <Marker position={position}>
                  <Popup>
                    <span>Sensor Position <br/> Latitude: {position[0]} <br/> Longitude: {position[1]}</span>
                  </Popup>
                </Marker>
              </Map>
            </CardMedia>
          </Card>
        </Container>
    } else {
      browserHistory.push('/sensors')
    }

    return (
      <div className="sensor">
        {renderElement}
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
    return {
      sensor: state.sensor.sensor
    }
}

function mapDispatchToProps(dispatch) {
  return {
    getSensor: (id) => {dispatch(getSensor(id)) },
    addMeasurement: (id, m) => {dispatch(addMeasurement(id, m)) },
    deleteMeasurement: (sid, mid) => {dispatch(deleteMeasurement(sid, mid)) },
    deleteSensor: (id) => {dispatch(deleteSensor(id)) },
    updateSensorLocation: (id, l) => {dispatch(updateSensorLocation(id, l)) },
    updateSensorName: (id, n) => {dispatch(updateSensorName(id, n)) },
    updateMeasurementName: (sensorId, measId, n) => {dispatch(updateMeasurementName(sensorId, measId, n)) }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(SensorDetail);
