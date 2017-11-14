import {lookup_course} from '../../dao/CourseManager';
import React, {Component} from 'react';

class AddCourse extends Component{

    constructor(props){
        super(props);
        this.title = "AddCourse.js";
        this.state = {
            result: [],
            search_key: ""
        };
    }

    lookup(course_code){
        lookup_course(course_code, this.callback_lookup_result.bind(this));
    }

    callback_lookup_result(err, data){
        this.setState({result:data});
    }

    render(){
        return(
            <div>

                <br/>

                <form >
                    <label>lookup_course</label>
                    <input type={"text"} value={this.state.search_key}
                           onChange={function(e){
                               this.setState({search_key:e.target.value});
                               this.lookup(e.target.value);
                           }.bind(this)}/>
                </form>

                {this.state.result.map(function(entry){
                    return (
                        <div key={"course-search-result"+entry.course_id}>
                            <br/>
                            <h2>{entry.course_code} [{entry.section}]: {entry.course_name}</h2>
                            <h5>{entry.instructor} | {entry.days} {entry.time} | {entry.location}</h5>
                        </div>
                    )
                })}

                <br/>
                Raw JSON:
                <pre>{JSON.stringify(this.state.result,null,2)}</pre>

            </div>
        )
    }

}

export default  AddCourse;