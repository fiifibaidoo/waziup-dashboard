import React, { Component } from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';
import { connect } from 'react-redux';
import SensorData from './SensorData.js'
import SensorStatus from './SensorStatus.js'
import SensorForm from './SensorForm.js'
import SensorActions from './SensorActions.js'
import { Container } from 'react-grid-system'
import Griddle, { plugins, RowDefinition, ColumnDefinition } from 'griddle-react';
import Utils from '../../lib/utils';
import { getSensors, createSensor, updateSensorLocation, updateSensorOwner, deleteSensor } from "../../actions/actions.js"
import * as Waziup from 'waziup-js'


class Sensors extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalAddSensor: false,
    };
  }
  
  componentDidMount() {
    this.props.getSensors();
  }

  handleSensorDelete = (sensor) => {
    this.props.deleteSensor(sensor.id);
  } 

  handleSubmitUpdate = (formData) => {
    console.log("sensor update:", formData);
    var loc = new Waziup.Location(formData.sensorLat, formData.sensorLon)
    this.props.updateSensorLocation(formData.sensorId, loc);
    this.props.updateSensorOwner(sensor.sensorId, this.props.user.preferred_username);
  }

  handleSubmit = (formData) => {
    var sensor = new Waziup.Sensor(formData.sensorId);
    sensor.location = {latitude: formData.sensorLat, longitude: formData.sensorLon}
    sensor.owner = this.props.user.preferred_username;
    this.props.createSensor(sensor);
  }

  render() {
    const rowDataSelector = (state, { griddleKey }) => {
      return state
        .get('data')
        .find(rowMap => rowMap.get('griddleKey') === griddleKey)
        .delete('griddleKey')
        .toJSON();
    };

    const enhancedWithRowData = connect((state, props) => {
      return {
        // rowData will be available into RowActions
        rowData: rowDataSelector(state, props),
        deleteAction: this.handleSensorDelete,
        updateAction: this.handleSensorUpdate,
        vectorAction: this.handleVectorSave
      };
    });
    return (
      <Container fluid={true}>
        <h1 className="page-title">Sensors</h1>
        <RaisedButton label="Add Sensors" primary={true} onTouchTap={() => this.setState({ modalAddSensor: true })} />
        <SensorForm ref={'sForm'} modalOpen={this.state.modalAddSensor} handleClose={() => this.setState({ modalAddSensor: false })} onSubmit={this.handleSubmit} />
        {
          <Griddle resultsPerPage={10} data={this.props.sensors} plugins={[plugins.LocalPlugin]} showFilter={true} styleConfig={Utils.styleConfig()} >
            <RowDefinition>
              <ColumnDefinition id="id" title="ID" />
              <ColumnDefinition id="owner" title="Owner" />
              <ColumnDefinition id="values" title="Values" customComponent={enhancedWithRowData(SensorData)} />
              <ColumnDefinition id="status" title="Status" customComponent={enhancedWithRowData(SensorStatus)} />
              <ColumnDefinition id="actions" title="Actions" customComponent={enhancedWithRowData(SensorActions)} />
            </RowDefinition>
          </Griddle>
        }
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return {
    sensors: state.sensors.sensors,
    user: state.keycloak.idTokenParsed
  };
}

function mapDispatchToProps(dispatch) {
  return {
    updateSensorSuccess: (sensor) => { dispatch(updateSensorSuccess(sensor)) },
    createSensor: (sensor) => {dispatch(createSensor(sensor)) }, 
    getSensors: () => {dispatch(getSensors()) },
    deleteSensor: (sensorId) => {dispatch(deleteSensor(sensorId)) },
    updateSensorLocation: (sensorId, location) => {dispatch(updateSensorLocation(sensorId, location)) },
    updateSensorOwner: (sensorId, owner) => {dispatch(updateSensorOwner(sensorId, owner)) }
  };
}
const SensorsContainer = connect(mapStateToProps, mapDispatchToProps)(Sensors);
export default SensorsContainer;
