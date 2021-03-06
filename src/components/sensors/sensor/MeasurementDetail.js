import React, { Component } from 'react';
import { Card, CardMedia, CardTitle } from 'material-ui/Card';
import { Container } from 'react-grid-system'
import SensorChart from './SensorChart';
import MeasurementCard from './MeasurementCard';
import { connect } from 'react-redux';
import { getValues, getSensors, addMeasurement, deleteMeasurement, createNotif } from "../../../actions/actions.js"
import RaisedButton from 'material-ui/RaisedButton';
import NotifForm from '../../notifs/NotifForm.js'
import NotifCard from '../../notifs/NotifCard.js'
import * as Waziup from 'waziup-js'
import { Link } from 'react-router';
import chartImage from '../../../images/chart-icon.png';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';

class MeasurementDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      selectedDayFrom: undefined,
      selectedDayTo: undefined,
    };
  
    this.handleDayChangeFrom = this.handleDayChangeFrom.bind(this);
    this.handleDayChangeTo = this.handleDayChangeTo.bind(this);
  }

  handleDayChangeFrom(day) {
    this.setState({ selectedDayFrom: day });
  }
  
  handleDayChangeTo(day) {
    this.setState({ selectedDayTo: day });
  }

  componentWillMount() {
    this.fetchValues()
    this.interval = setInterval(() => { this.fetchValues() }, 10000);
  }

  
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  fetchValues = () => {
    this.props.getSensors();
    
    console.log(this.state.selectedDayFrom, this.state.selectedDayTo);

    if (this.props.sensor) {
      this.props.getValues(this.props.params.sensorId, this.props.params.measId,
         this.props.sensor.domain, { lastN: 100 });
    }
  }

  render() {
    console.log("modal:" + JSON.stringify(this.state.modalOpen))
    if (this.props.meas) {
      const defaultNotif = Waziup.Notification.constructFromObject({
        subject: { entityNames: [this.props.sensor.id], condition: { attrs: [this.props.meas.id], expression: "TC>30" } },
        notification: { channels: [], message: "Waziup: High temperature warning. ${id} value is ${TC}", usernames: [this.props.user.username] },
        description: "Send message",
        throttling: 1
      })
      console.log("defaultModal:" + JSON.stringify(defaultNotif))
      var notifications = []
      if (this.props.notifs) {
        for (var notif of this.props.notifs) {
          const card =
            <Link to={"/notifications/" + notif.id} >
              <NotifCard className="sensorNode"
                notif={notif}
                isEditable={false} />
            </Link>
          notifications.push(card)
        }
      }

      return (
        <Container fluid={true}>
          <h1 className="page-title">
            <img src={chartImage} height="50" />
            Measurement: {this.props.meas.id}
          </h1>
          <Card className="sensorNode">
            <CardTitle>
              <h2 className="cardTitle"> Last value </h2>
              <RaisedButton label="Add Notification" onTouchTap={() => this.setState({ modalOpen: true })} primary={true} className="topRightButton" />
              <NotifForm modalOpen={this.state.modalOpen}
                notif={defaultNotif}
                sensors={this.props.sensors}
                users={this.props.users}
                onSubmit={this.props.createNotif}
                handleClose={() => this.setState({ modalOpen: false })}
                isEditable={true} />
            </CardTitle>
            <MeasurementCard measurement={this.props.meas}
              isDetails={true}
              updateMeasurement={this.props.updateMeasurement}
              deleteMeasurement={this.props.deleteMeasurement}
              sensorId={this.props.sensorId} />
          </Card>
          {notifications.length > 0 ?
            <Card className="sensorNode">
              <CardTitle>
                <h2 className="cardTitle"> Notifications </h2>
              </CardTitle>
              {notifications}
            </Card> : null}
          <Card className="graphCard">
            <CardTitle>
              <h2 className="cardTitle"> Historical chart </h2>
            </CardTitle>
            <CardMedia>
              From: <DayPickerInput
                dayPickerProps={{
                  month: new Date(2018, 10),
                  showWeekNumbers: true,
                  todayButton: 'Today',
                }}
                onDayChange={this.handleDayChangeFrom}
                />

              To: <DayPickerInput
                dayPickerProps={{
                  month: new Date(2018, 10),
                  showWeekNumbers: true,
                  todayButton: 'Today',
                }}
                onDayChange={this.handleDayChangeTo}
              />
              <SensorChart meas={this.props.meas} values={this.props.values} />
            </CardMedia>
          </Card>
        </Container>
      );
    } else {
      return (<h1> Measurement view is being loaded... </h1>)
    }
  }
}

function mapStateToProps(state, ownProps) {
  const sensor = state.sensors.sensors.find(s => s.id === ownProps.params.sensorId)
  const meas = sensor ? sensor.measurements.find(m => m.id == ownProps.params.measId) : null
  const notifs = meas && sensor ? state.notifications.notifications.filter(n => n.subject.entityNames.includes(sensor.id) && n.subject.condition.attrs.includes(meas.id)) : null
  return {
    sensor: sensor,
    meas: meas,
    user: state.user,
    values: state.values.values,
    sensors: state.sensors.sensors,
    users: state.users.users,
    notifs: notifs
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getValues: (sid, mid, d, opts) => { dispatch(getValues(sid, mid, d, opts)) },
    getSensors: () => { dispatch(getSensors()) },
    updateMeasurement: (id, m) => { dispatch(addMeasurement(id, m)) },
    deleteMeasurement: (sid, mid) => { dispatch(deleteMeasurement(sid, mid)) },
    createNotif: (notif) => { dispatch(createNotif(notif)) }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MeasurementDetail);
