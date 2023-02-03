from flask import Flask, render_template, request, jsonify, session, Response, send_file
from flask_pymongo import PyMongo
from sklearn.cluster import KMeans
from sklearn import preprocessing
import pandas as pd
from io import StringIO
import numpy as np
import math
from bson.objectid import ObjectId
import json

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb+srv://VaiLab:VaiLab123@cluster0.4nqps.mongodb.net/ambientSonic"
app.config["SECRET_KEY"] = '80e2229aa326ca04ee982aa63b9b0f13'
mongo = PyMongo(app)

# mongodb+srv://VaiLab:VaiLab123@cluster0-4nqps.mongodb.net/test?authSource=admin&replicaSet=Cluster0-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true

@app.route("/")
def testSpatialAudio():
	return render_template("testSpatialAudio.html",title = "testSpatialAudio")

@app.route("/condition1")
def condition1():
	return render_template("condition1.html",title = "Data Sonification")

@app.route("/condition2")
def condition2():
	return render_template("index2.html",title = "Data Sonification")

@app.route("/create_sound")
def create_sound():
	return render_template("create_sound.html",title = "Data Sonification")

@app.route("/read_stock_categories", methods=['POST']) 
def read_stock_categories():	
	df = pd.read_csv('./static/data/study_data/all_stocks_5yr.csv')
	return jsonify(msg="success",stocks = df.Name.unique().tolist())

@app.route("/read_stock_data", methods=['POST']) 
def read_stock_data():	
	df = pd.read_csv('./static/data/study_data/all_stocks_5yr.csv')
	json_data = request.get_json(force=True)
	attrs = json_data["attrs"]
	# print(attrs)
	pivot = df.pivot(index='date', columns='Name', values='close').reset_index()
	# new_attrs = ['date']+attrs
	pivot = pivot[attrs]
	# print(pivot.to_dict('records'))
	return jsonify(msg="success",stocks = pivot.to_dict('records'))

@app.route('/save_bar_data',methods=['POST'])
def save_bar_data():
	import os
	json_data = request.get_json(force=True)
	data = json_data["data"]

	df = pd.DataFrame.from_records(data)
	csv_data = df.to_csv(index=False)

	return Response(
        csv_data,
        mimetype="text/csv",
        headers={"Content-disposition":
                 "attachment; filename=myplot.csv"})

@app.route('/load_random_scatter_data',methods=['POST'])
def load_random_scatter_data():

	df = pd.DataFrame()
	df['x'] = np.random.uniform(-1, 1, size=(50,))
	df['y'] = np.random.uniform(-1, 1, size=(50,))

	return jsonify(msg="success",data=df.to_dict("records"))

@app.route("/read_bar_data", methods=['POST']) 
def read_bar_data():
	if request.method == 'POST':
		csv_file = request.get_json(force=True);		
		df = pd.read_csv(StringIO(csv_file['content']))
		
		return jsonify(msg="success",data=df.to_dict("records"))

@app.route("/read_bar_data_study", methods=['POST']) 
def read_bar_data_study():
	if request.method == 'POST':
		req = request.get_json(force=True);		
		df = pd.read_csv('./static/data/study_data/'+req['file_name'])
		
		return jsonify(msg="success",data=df.to_dict("records"))

@app.route("/read_scatter_data", methods=['POST']) 
def read_scatter_data():
	if request.method == 'POST':
		csv_file = request.get_json(force=True);		
		df = pd.read_csv(StringIO(csv_file['content']))
		# radius = []
		# theta = []

		# for ind, row in df.iterrows():
		# 	r = math.sqrt( row['x'] * row['x'] + row['y'] * row['y'] )
		# 	# Calculating angle (theta) in radian
		# 	t = math.atan(row['y']/row['x'])
		# 	# Converting theta from radian to degree
		# 	t = 180 * t/math.pi

		# 	radius.append(r)
		# 	theta.append(t)

		# df['radius'] = radius
		# df['theta'] = theta
		
		return jsonify(msg="success",data=df.to_dict("records"))

@app.route("/save_base64",methods=['POST'])
def save_base64():
	import base64
	json_data = request.get_json(force=True)
	img_data = json_data["base64"]
	# img_data = request.args.get("base64")
	loc = session.get('data_loc')+"/imageToSave.png"
	with open(loc, "wb") as f:
		f.write(base64.decodebytes(bytes(img_data.split(",")[1],'utf-8')))

	return jsonify(msg="success")

@app.route('/save_user',methods=['POST'])
def save_user():
	import os
	json_data = request.get_json(force=True);
	user_name = json_data["user_name"]
	session['user_name'] = user_name
	print(user_name)
	return jsonify(msg="successs")

@app.route('/getQA',methods=['POST'])
def getQA():
	json_data = request.get_json(force=True)
	chartNumber = json_data["chartNumber"]
	subjective = json_data["subjective"]

	try:
		if subjective:
			print("enter")
			QA = mongo.db.study2_questions
			chartNumber = 0
		else:
			QA = mongo.db.questions
		res = QA.find({'chartNumber':chartNumber})
		ret = []
		for r in res:
			print(r)
			ret.append({'chartNumber':r['chartNumber'],'questions':r['questions'],'answers':r['answers']})

		return jsonify(qa=ret,msg="success")
	except Exception as e:
		print(e)
		return jsonify(msg="failed")


@app.route('/get_csv/', methods=['POST'])
def get_csv():
	json_data = request.get_json(force=True)
	fileName = json_data["fileName"]
	df = pd.read_csv(fileName)
	return jsonify(msg="successs",data = df.to_dict("records"))

@app.route("/clusters",methods=['POST'])
def get_clusters():
	json_data = request.get_json(force=True)
	x = pd.DataFrame.from_records(json_data["data"])
	k = json_data["k"]
	# x = data.values #returns a numpy array
	# min_max_scaler = preprocessing.MinMaxScaler()
	# x = min_max_scaler.fit_transform(x)

	kmeans = KMeans(n_clusters=k, random_state=0).fit(x)
	print(kmeans.cluster_centers_)

	return jsonify(msg="successs",cluster_centers = kmeans.cluster_centers_.tolist())

# --------------------------- SAVE DATA FOR STUDY -----------------------------
@app.route("/save_csv_data_to_db/<file_name>/<type>/<condition>") 
def save_csv_data_to_db(file_name, type, condition):

	collection = mongo.db.study_data

	df = pd.read_csv('./static/data/study_data/'+ file_name)

	collection.insert_one({'type': type, 'condition': condition, 'data': df.to_dict("records"), 'index': -1})

	return jsonify(msg="success")

@app.route("/get_study_data") 
def get_study_data():

	collection = mongo.db.study_data

	active = collection.find_one({'active':1})
	obj = dict()
	for k in active:
		if k != '_id':
			obj[k] = active[k]
	
	return jsonify(msg="success", obj = obj)

@app.route("/get_all_study_data")
def get_all_study_data():

	collection = mongo.db.study_data
	all = collection.find({})
	res = []
	for a in all:
		# a.pop('_id', None)
		obj = {}
		for k,v in a.items():
			if k == '_id':
				v = str(v)
			obj[k] = v
		res.append(obj)

	return jsonify(msg="success", res = res)

@app.route("/update_study_data",methods=['POST'])
def update_study_data():
	json_data = request.get_json(force=True)
	collection = mongo.db.study_data
	
	collection.update_one({'_id': ObjectId(json_data['_id'])},{
            '$set':{
				json_data['attr']: json_data['index']
			}},upsert=True)

	return jsonify(msg="success")
	
@app.route("/study/<user_id>/<order>")
def study(user_id, order):
	session['user_id'] = user_id
	f = open('./static/data/study_data/task_order.json')
	data = json.load(f)
	return render_template("study.html", task_order=data, order=order)

@app.route("/save_answer",methods=['POST'])
def save_answer():
	if 'user_id' in session:
		json_data = request.get_json(force=True)
		ans_id = json_data['ans_id'].split("-")

		collection = mongo.db.user
		query = { 'user_id':  session['user_id'], 'index': int(ans_id[1]), 'ques': int(ans_id[2])}
		update = { '$set': { 'user_id': session['user_id'], 'index': int(ans_id[1]), 'ques': int(ans_id[2]), 'ans': int(ans_id[3])}}

		collection.update_one(query, update, upsert=True)

		return jsonify(msg="success")
	else:
		return jsonify(msg="failed")

@app.route("/order")
def order():
	return render_template("order_study_data.html")

@app.route("/examples")
def examples():
	return render_template("examples.html")

@app.route("/study_materials")
def study_materials():
	return render_template("study_materials.html")


if __name__ == "__main__":
    app.run(port=5000, debug=True)
