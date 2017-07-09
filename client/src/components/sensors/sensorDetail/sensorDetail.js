import React, { Component } from 'react';
import { Card, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import { Container } from 'react-grid-system'
import { List, ListItem } from 'material-ui/List';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import SensorChart from './SensorChart/SensorChartContainer';
import UTIL from '../../../lib/utils.js';
import { loadSensors } from "../../../index.js"
import moment from 'moment-timezone';

var position = [12.238, -1.561];
class sensorDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sensor: {},
      dateModified: "not available",
      dateCreated: "not available",
      servicePath: "/",
      service: "waziup",
      markers: [],
      id: this.props.params.sensorId,
      historicalData: {},
    };

    loadSensors(true);
  }
  
  componentWillReceiveProps(nextProps) {
    if (nextProps.sensors && this.props.params.sensorId) {
      var sensor = nextProps.sensors.find((el) => {
        return el.id === this.props.params.sensorId;
      });
      this.setState({ sensor: sensor });

      if (sensor.dateModified && sensor.dateModified.value) {
        this.setState({ dateModified: sensor.dateModified.value });
      }
      if (sensor.dateCreated && sensor.dateCreated.value) {
        this.setState({ dateCreated: sensor.dateCreated.value });
      }
      if (sensor.servicePath && sensor.servicePath.value) {
        this.setState({ servicePath: sensor.servicePath.value });
      }

      var markers = [];
      if (sensor.location && sensor.location.coordinates) {
        markers.push({
          position: [
            sensor.location.coordinates[1],
            sensor.location.coordinates[0]
          ],
          defaultAnimation: 2,
        });
      }
      position = markers[0].position;
      this.setState({ markers: markers })
    }
  }

  render() {
    const listMarkers = this.state.markers.map((marker, index) =>
      <Marker key={index} position={marker.position}>
        <Popup>
          <span>Sensor infos<br />{marker.position}</span>
        </Popup>
      </Marker>
    );

    return (
      <div className="sensor">
        <h1 className="page-title">Sensor: {this.state.id}</h1>
        <Container fluid={true}>
          <Card>
            <CardTitle title="Sensor Location" />
            <CardMedia>
              <Map ref="map" center={position} zoom={8}>
                <TileLayer
                  url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                />
                {listMarkers}
              </Map>
            </CardMedia>
            <CardTitle title="Current Values" />
            <CardText>
              <List>
                {UTIL.getMeasurements(this.state.sensor).map((itemID) => {
                  return (
                    <ListItem primaryText={itemID.key + ": " + itemID.value} />
                  )
                })}
                <ListItem primaryText={"Creation Date: " + moment(this.state.dateCreated).tz(moment.tz.guess()).format('MMMM Do YYYY H:mm a z')} />
                <ListItem primaryText={"Last Updates: " + moment(this.state.dateModified).tz(moment.tz.guess()).format('MMMM Do YYYY H:mm a z')} />
                <ListItem primaryText={"Service Path: " + this.state.servicePath} />
              </List>
            </CardText>
            <CardTitle title="Historical Data" />
            <SensorChart sensorid={this.props.params.sensorId} service={this.state.service} servicePath={this.state.servicePath}/>
          </Card>
        </Container>
      </div>
    );
  }
}

export default sensorDetail;