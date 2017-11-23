import React, {Component} from 'react';
import AddCourse from './AddCourse'
import DropCourse from './DropCourse';
import AddEvent from './AddEvent';
import RemoveEvent from './RemoveEvent'
import ReactDOM from 'react-dom';
import CalendarHelper from '../../api/CalendarHelper';
import RecommendedFriends from "../social/RecommendedFriends";
import {lookup_course_by_id} from "../../dao/CourseManager";
import {get_time_numeric} from "../../api/TimeHelper";
import {get_self_profile} from "../../api/StaticData";

class UserSchedule extends Component {

    constructor(props) {
        super(props);
        this.title = "UserSchedule.js";
        this.state = {
            events: [],
            other_events: []
        };

        this.initialize_events();
    }

    goto_AddCourse() {
        ReactDOM.render(<AddCourse/>, document.getElementById('main-layout'));
    }

    goto_RecommendedFriends() {
        ReactDOM.render(<RecommendedFriends/>, document.getElementById('main-layout'));
    }

    goto_DropCourse() {
        ReactDOM.render(<DropCourse/>, document.getElementById('main-layout'));
    }

    goto_AddEvent() {
        ReactDOM.render(<AddEvent/>, document.getElementById('main-layout'));
    }
    goto_RemoveEvent(){
        ReactDOM.render(<RemoveEvent />, document.getElementById('main-layout'));
    }


    // This function will initialize all the events (classes) of the user
    initialize_events() {

        let profile_obj = get_self_profile();

        let enrolled_obj = profile_obj.enrolled_courses;
        let course_list = Object.keys(enrolled_obj);
        let events = [];

        // This is used to parsed all the other user added events
        let raw_other_events = profile_obj.upcoming_events;
        console.log(raw_other_events);
        let other_events = [];

        for (let event_id in raw_other_events)
        {
            let curr_event = raw_other_events[event_id];

            // A backward compatibility check, making sure start_time and end_time are in event
            if (! ("start_time" in curr_event) || !("end_time" in curr_event) )
            {
                continue;
            }
            let parsed_event = { "title":"", "start":null, "end":null };

            if (curr_event.location !== "")
                parsed_event["title"] = curr_event.event_name + " at " + curr_event.location;
            else
                parsed_event["title"] = curr_event.event_name;

            parsed_event["start"] = new Date( curr_event.day + "T" + curr_event.start_time );
            parsed_event["end"] = new Date( curr_event.day + "T" + curr_event.end_time );
            other_events.push(parsed_event);
        }
        this.state.other_events = other_events;

        // This is used to parse all the other events
        course_list.forEach((course_id) => {

            lookup_course_by_id(course_id, (err, course_obj) => {

                // prelim check of error
                if (err || course_obj === null) {
                    console.log(err);
                    return;
                }

                // is_error is used to see if the get_time_numeric function has returned an error
                let is_error = false;
                let event = null;
                if (course_obj.time !== null && course_obj.days !== null && course_obj.title !== null) {
                    event = {
                        "title": course_obj.course_id,
                        "days": course_obj.days,
                        "hours":
                            [get_time_numeric(course_obj.time.split(' - ')[0], function (err) {
                                if (err) {
                                    console.log(err);
                                    is_error = true;
                                }
                            }), get_time_numeric(course_obj.time.split(' - ')[1], function (err) {
                                if (err) {
                                    console.log(err);
                                    is_error = true;
                                }

                            })]
                    };
                }

                // If invalid course_obj is detected
                else {
                    event = {
                        "title": "undefined states in Course Obj is detected",
                        "days": "MTWThF",
                        "hours": ["0000", "2359"]
                    };
                }

                // If get_time_numeric returns an error, return some random time
                if (is_error) {
                    event.hours = ["0000", "2359"];
                }

                // push the event into the events list
                events.push(event);

                // set the state of UserSchedule
                this.setState({events: events});
                ReactDOM.render(<CalendarHelper events={this.state.events}
                                                other_events={this.state.other_events}
                                                key={"calendar-" + (this.state.events.length + this.state.other_events.length) }/>,
                    document.getElementById('calendar-helper-container')
                )
            });
        });

    }

    // In case the user did not have any classes
    componentDidMount()
    {
        ReactDOM.render(<CalendarHelper events={this.state.events}
                                        other_events={this.state.other_events}
                                        key={"calendar-" + (this.state.events.length + this.state.other_events.length) }/>,
            document.getElementById('calendar-helper-container') );
    }

    render() {

        return (

            <div align={'center'}>

                <img
                    src={"https://res.cloudinary.com/teepublic/image/private/s--8-dGDDZg--/t_Preview/b_rgb:ffffff,c_limit,f_jpg,h_630,q_90,w_630/v1470902298/production/designs/627022_1.jpg"}
                    alt={""} width={"300"}/>
                <h1>{this.title}</h1>

                <button onClick={this.goto_AddCourse.bind(this)}>Add course</button>
                <button onClick={this.goto_DropCourse.bind(this)}>Drop course</button>
                <button onClick={this.goto_AddEvent.bind(this)}>Add Event</button>
                <button onClick={this.goto_RemoveEvent.bind(this)}>Remove Event</button>
                <button onClick={this.goto_RecommendedFriends.bind(this)}>Recommended Friends</button>
                <br/>

                <div id='calendar-helper-container'> </div>


                <h4>いつでもダラダラしたいなぁ...</h4>
                <h4> うまるちゃん！遊びやめてください、手伝いましょう </h4>


            </div>


        )
    }
}

export default UserSchedule;