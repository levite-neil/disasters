import numpy as np
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
import json
from flask import Flask, jsonify


#################################################
# Database Setup
#################################################
engine = create_engine("postgresql://postgres:postgres@localhost:5432/disaster_fema_db")

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(autoload_with=engine)

# Save reference to the table
Disaster = Base.classes.disasters

#################################################
# Flask Setup
#################################################
app = Flask(__name__)


#################################################
# Flask Routes
#################################################

@app.route("/")
def welcome():
    """List all available Storm Trooper api routes."""
    return (
        f"Available Storm Trooper Routes:<br/>"
        f"/api/v1.0/disasternames<br/>"
        f"/api/v1.0/disasterstates<br/>"
        f"/api/v1.0/disasterdata</br>"
    )


@app.route("/api/v1.0/disasternames")
def disasternames():
    # Create our session (link) from Python to the DB
    session = Session(engine)

    """Return a list of all disaster names"""
    # Query all passengers
    results = session.query(Disaster.disastername).all()

    session.close()

    # Convert list of tuples into normal list
    all_names = list(np.ravel(results))

    return jsonify(all_names)


@app.route("/api/v1.0/disasterstates")
def disasterstates():
    # Create our session (link) from Python to the DB
    session = Session(engine)

    """Return a list of disaster data including the disaster name, state, and type of each disaster"""
    # Query all passengers
    results = session.query(Disaster.disastername, Disaster.statename, Disaster.incidenttype).all()

    session.close()

    # Create a dictionary from the row data and append to a list of all_passengers
    all_disasters = []
    for disastername, state, type in results:
        disaster_dict = {}
        disaster_dict["disastername"] = disastername
        disaster_dict["state"] = state
        disaster_dict["type"] = type
        all_disasters.append(disaster_dict)

    return jsonify(all_disasters)

@app.route("/api/v1.0/disasterdata")
def disasterdata():
    # Create session and query all disasters
    session = Session(engine)
    results = session.query(Disaster.disasternumber, Disaster.disastername, Disaster.incidentbegindate, Disaster.incidentenddate, Disaster.statecode, Disaster.statename, Disaster.incidenttype).all()
    
    session.close()

    # Create dictionary from the row data and append to list of all disasters
    FemaWebDisasterDeclarations = []

    for disasterNumber, disasterName, incidentBeginDate, incidentEndDate, stateCode, stateName, incidentType in results:
        incident_dict = {}
        incident_dict['disasterNumber'] = disasterNumber
        incident_dict['disasterName'] = disasterName
        incident_dict['incidentBeginDate'] = incidentBeginDate
        incident_dict['incidentEndDate'] = incidentEndDate
        incident_dict['stateCode'] = stateCode
        incident_dict['stateName'] = stateName
        incident_dict['incidentType'] = incidentType
        FemaWebDisasterDeclarations.append(incident_dict)

    #download the json file
    with open('disaster_data.json', 'w') as outdisaster:
        json.dump(FemaWebDisasterDeclarations, outdisaster)

    return jsonify(FemaWebDisasterDeclarations)



if __name__ == '__main__':
    app.run(debug=True)
