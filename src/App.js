import React, {Component} from 'react';
import './App.css';
import locations from './locations';
import timeslots from './timeslots_summary';
import leftPad from 'left-pad';
import inputsCount from './inputs_count';

const TIMESLOT_LENGTH = 250;
const MAGNIFICATION_FACTOR = 1.5;
const POTENTIAL = false; // Doesn't work yet!

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            currentSlotCounter: -1,
            currentSlot: {},
            msPerSlot: TIMESLOT_LENGTH,
            slotSpeed: TIMESLOT_LENGTH,
            playing: false
        };
    }


    componentDidMount() {
    }

    advanceSlot() {
        const {currentSlotCounter, slotSpeed} = this.state;
        if (currentSlotCounter + 1 > timeslots.length - 1) {
            this.setState({playing: false});
            return;
        }

        console.log(`New slot: ${currentSlotCounter + 1}`);

        this.setState({
            currentSlotCounter: currentSlotCounter + 1,
            currentSlot: timeslots[currentSlotCounter + 1]
        });

        this.timer = setTimeout(() => this.advanceSlot(), slotSpeed);
    }

    sumPerLocationList(currentSlot, locationList) {
        return Object.keys(currentSlot).filter(key => locationList.includes(key)).map(key => currentSlot[key]).reduce((acc, item) => acc + item, 0);
    }

    hoursToDaysHours(hoursTotal) {
        const days = Math.floor(hoursTotal / 24);
        const hours = hoursTotal % 24;
        return {days, hours};
    }

    formatHoursDays({hours, days}) {
        if (hours === 0 && days === 0)
            return "0 hours"
        else
            return `${days === 0 ? "" : days === 1 ? days + " day" : days + " days"} ${hours === 0 ? "" : hours === 1 ? hours + " hour" : hours + " hours"}`;
    }

    handleSpeedChange(event) {
        this.setState({msPerSlot: event.target.value});
    }

    handleSlotSpeedUpdate(event) {
        const {msPerSlot, playing, currentSlotCounter} = this.state;
        this.setState({slotSpeed: this.state.msPerSlot});
        if (playing) {
            clearTimeout(this.timer);
            this.setState({playing: false});
        } else {
            if (currentSlotCounter === (timeslots.length - 1)) {
                // reset
                console.log(currentSlotCounter);
                this.setState({playing: false, currentSlotCounter: 0, currentSlot: timeslots[0]});
            } else {
                this.setState({playing: true});
                this.timer = setTimeout(() => this.advanceSlot(), msPerSlot);
            }
        }
    }


    render() {
        const {admission_locations, intermediate_locations, discharge_locations} = locations;

        const {currentSlot, currentSlotCounter, playing} = this.state;

        const totalPerSlot = Object.keys(currentSlot).map(key =>
            currentSlot[key]).reduce((acc, item) => acc + item, 0
        );

        const {days, hours} = this.hoursToDaysHours(currentSlotCounter + 1);

        const totalItems = Object.keys(timeslots[timeslots.length - 1]).map(key =>
            timeslots[timeslots.length - 1][key]).reduce((acc, item) => acc + item, 0
        );

        console.log(currentSlot);

        return (
            <div className="App">
                <header className="App-header">
                    <div className={["controls left-controls"]}>
                        <span>{`Current Progress: ${this.formatHoursDays({
                            hours,
                            days
                        })} out of ${this.formatHoursDays(this.hoursToDaysHours(timeslots.length))}`}</span>
                    </div>
                    <div className={["controls right-controls"]}>
            <span>
              {/*{`# of items: ${leftPad(totalPerSlot, 6, '\u00A0')}. `}*/}
                <span>
                <input
                    value={this.state.msPerSlot}
                    onChange={this.handleSpeedChange.bind(this)}
                    style={{width: "30px"}}
                />
                <button onClick={this.handleSlotSpeedUpdate.bind(this)}>
                  {playing ? '⏸' : currentSlotCounter === timeslots.length - 1 ? '↺' : '►'}
                </button>
              </span>
                {`Slot: ${leftPad(currentSlotCounter + 1, timeslots.length.toString().length, '\u00A0')}/${timeslots.length} `}
                {`(${leftPad(Math.round((currentSlotCounter + 1) / timeslots.length * 100), 3, '\u00A0')}%)`}
            </span>
                    </div>
                    <div className="diagram-container">
                        <div className="admission-locations">
                            <div className="diagram-label">
                                Admission Locations
                                ({(this.sumPerLocationList(currentSlot, admission_locations) / totalPerSlot).toFixed(2)})
                            </div>
                            <div className="diagram-content">
                                {
                                    admission_locations.map(label => {
                                        const locationCount = currentSlot[label];
                                        const size = locationCount / totalItems * 100 * MAGNIFICATION_FACTOR;
                                        const potentialSize = (inputsCount[label] - locationCount) / Object.keys(inputsCount).map(key => inputsCount[key]).reduce((acc, val) => acc + val, 0) * 100 * MAGNIFICATION_FACTOR;

                                        return <div id={label} key={label} className={["location-wrapper"]}>
                                            <div className={["location-label"]}>{label} ({locationCount ? locationCount : 0})</div>
                                            <div className={["location-content"]}>
                                                <div className={["location-circle"]} style={
                                                    {
                                                        width: `${size}px`,
                                                        height: `${size}px`,
                                                        borderRadius: "50%",
                                                        backgroundColor: "#D16B97",
                                                        zIndex: "5"
                                                    }
                                                }/>
                                                {
                                                    POTENTIAL ? (
                                                        <div className={["location-potential-circle"]} style={{
                                                            width: `${potentialSize}px`,
                                                            height: `${potentialSize}px`,
                                                            borderRadius: "50%",
                                                            backgroundColor: "pink",
                                                            zIndex: "1",
                                                            position: "absolute"
                                                        }}
                                                        />
                                                    ) : <></>
                                                }
                                            </div>
                                        </div>;
                                    })
                                }
                            </div>
                        </div>
                        <div className="intermediate-locations">
                            <div className="diagram-label">
                                Intermediate Locations
                                ({(this.sumPerLocationList(currentSlot, intermediate_locations) / totalPerSlot).toFixed(2)})
                            </div>
                            <div className="diagram-content">
                                {
                                    intermediate_locations.map(label => {
                                        const locationCount = currentSlot[label];
                                        const size = locationCount / totalItems * 100 * MAGNIFICATION_FACTOR;

                                        return <div id={label} key={label}  className={["location-wrapper"]}>
                                            <div className={["location-label"]}>{label} ({locationCount ? locationCount : 0})</div>
                                            <div className={["location-content"]}>
                                                <div className={["location-circle"]} style={
                                                    {
                                                        width: `${size}px`,
                                                        height: `${size}px`,
                                                        borderRadius: "50%",
                                                        backgroundColor: "#86A8E7"
                                                    }
                                                }/>
                                            </div>
                                        </div>;
                                    })
                                }
                            </div>
                        </div>
                        <div className="discharge-locations">
                            <div className="diagram-label">
                                Discharge Locations
                                ({(this.sumPerLocationList(currentSlot, discharge_locations) / totalPerSlot).toFixed(2)})
                            </div>
                            <div className="diagram-content">
                                {
                                    discharge_locations.map(label => {
                                        const locationCount = currentSlot[label];
                                        const size = locationCount / totalItems * 100 * MAGNIFICATION_FACTOR;

                                        return <div id={label} key={label}  className={["location-wrapper"]}>
                                            <div className={["location-label"]}>{label} ({locationCount ? locationCount : 0})</div>
                                            <div className={["location-content"]}>
                                                <div className={["location-circle"]} style={
                                                    {
                                                        width: `${size}px`,
                                                        height: `${size}px`,
                                                        borderRadius: "50%",
                                                        backgroundColor: "#5FFBF1"
                                                    }
                                                }/>
                                            </div>
                                        </div>;
                                    })
                                }
                            </div>
                        </div>
                    </div>
                </header>
            </div>
        );
    }
}

export default App;
