#------------- IMPORT MODULES ---------------#

from __future__ import division
import flask
from flask import render_template
from pymongo import MongoClient
import time
from county_geo import *
from twitter_functions import *
import math
from datetime import date, timedelta, datetime
import re
from collections import defaultdict
from gensim.models.ldamodel import LdaModel
from gensim import corpora, models, similarities

#---------- URLS AND WEB PAGES -------------#

# Initialize the app
app = flask.Flask(__name__)

# Homepage
@app.route("/")
def home():
    """
    Homepage: serve our visualization page, awesome.html
    """
    # with open("index.html", 'r') as file:
    #     return file.read()
    return render_template('index.html')

# Get an example and return it's score from the predictor model
@app.route("/wordcloud", methods=["POST"])
def wordcloud():
    """
    When A POST request is made to this uri, return the momentum.
    """

    # Put the result in a nice dict so we can send it as json
    # results = find_momentum()
    data = flask.request.json
    topics = { 'data' : get_topic_dictionary(data['candidate'],data['date']) }
    # topics = { 'data' : get_topic_dictionary("Hillary Clinton","2015-06-13") }
    # topics = { 'data' : [{"size":50, "text":"hillary"}, {"size":100, "text":"clinton"}, {"size":24, "text":"test"}]}
    return flask.jsonify(topics)

@app.route("/tweets", methods=["POST"])
def tweets():
    """
    When A POST request is made to this uri, return tweets in the last time period.
    """
    data = flask.request.json
    tweets = return_tweets(data['hrs'], data['search'])
    # results = tweet_booststrapper(tweets)
    # results = get_all_candidates(1000)
    return flask.jsonify(tweets)

@app.route("/candidates", methods=["POST"])
def candidates():
    """
    When A POST request is made to this uri, return all candidate data in the last time period.
    """
    data = flask.request.json
    tweets = { 'data': get_all_candidates_js_objects(10, data['group'], data['individual']) }
    # tweets = get_all_candidates_js_objects(10)
    # tweets = {1:1,2:2,3:3,4:4,5}
    return flask.jsonify(tweets)

@app.route("/candidate/<name>")
def candidate(name=None):
    """
    When A POST request is made to this uri, return all candidate data in the last time period.
    """
    # data = flask.request.json
    # tweets = { 'data': get_all_candidates_js_objects(10, data['group'], data['individual']) }
    # tweets = get_all_candidates_js_objects(10)
    # tweets = {1:1,2:2,3:3,4:4,5}
    return render_template('candidate.html', name=candidate_slugs[name])

@app.route("/maps", methods=["POST"])
def maps():
    """
    When A POST request is made to this uri, return all candidate data in the last time period.
    """
    data = flask.request.json
    tweets = get_candidate_map(time=0, n=0, all_results=1, candidate)
    tweets = { 'data': get_all_candidates_js_objects(10, data['group'], data['individual']) }
    # tweets = get_all_candidates_js_objects(10)
    # tweets = {1:1,2:2,3:3,4:4,5}
    return flask.jsonify(tweets)

@app.route("/map/<name>")
def map(name=None):
    """
    When A POST request is made to this uri, return all candidate data in the last time period.
    """
    # data = flask.request.json
    # tweets = { 'data': get_all_candidates_js_objects(10, data['group'], data['individual']) }
    # tweets = get_all_candidates_js_objects(10)
    # tweets = {1:1,2:2,3:3,4:4,5}
    return render_template('map.html', name=candidate_slugs[name])

@app.route("/stream", methods=["POST"])
def stream():
    """
    When A POST request is made to this uri, return all tweets from the last 10 seconds.
    """
    tweets = { 'tweets' : return_last_tweets() }
    # tweets = { 'tweets' : ["test"] }
    return flask.jsonify(tweets)

if __name__ == '__main__':
    app.run(debug=True)
#--------- RUN WEB APP SERVER ------------#

# Start the app server on port 80
# (The default website port)
app.run(host='0.0.0.0', port=5000)
