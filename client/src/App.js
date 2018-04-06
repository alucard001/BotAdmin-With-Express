import React, { Component } from 'react';
import axios from 'axios';
import ReactFileReader from 'react-file-reader';
import csvReader from 'papaparse';
import dotenv from 'dotenv'

import './App.css';

dotenv.config();

class App extends Component {

	constructor(props) {
		super(props);

		this.state = {
			intentOptions: [],
			utterance: '',
			intent: ''
		};

		this.axiosInstance = axios.create({
			baseURL: process.env.SERVER_URL
		});
	}

	componentWillMount = () => {
	}

	componentDidMount = () => {
		this.axiosInstance.get("/getLUISIntent")
			.then((res) => {
				// console.log(res.data);
				this.setState({ intentOptions: res.data.intents });
				this.allIntents = res.data.intents;
			});
		return;
	}

	componentDidUpdate = (prevProps, prevState) => {
	}

	shouldComponentUpdate = (nextProps, nextState) => {
		return true;
	}

	// getLUISEntities = () => {
	// 	return this.axiosInstance.get()
	// }

	submitToLUIS = () => {
		// console.log("Submit to LUIS: ", this.state);

		// text and intentName are MS BotFramework variables.
		// Ref: https://westus.dev.cognitive.microsoft.com/docs/services/5890b47c39e2bb17b84a55ff/operations/5890b47c39e2bb052c5b9c08
		if(this.state.intent !== ''){
			return axios.post('/addUtteranceToIntent', {
						text: this.state.utterance,
						intentName: this.state.intent
					})
					.then((resp) => {
						console.log(resp.data);
						return resp.data
					});
		}
	};

	onChangeSelect = (e) => {
		this.setSelectedIntent(e);
		// this.loadIntentList(e);
	}

	loadIntentList = async (e) => {
		const selIntentName = e.target.value;
		console.log(selIntentName);

		let utterancesList = [];
		utterancesList = await this.axiosInstance.get('/examples')
			.then((res) => {
				// console.log(res);
				return res.data
			});
		console.log(utterancesList);
		return utterancesList;
	}

	setSelectedIntent = (e) => {
		this.setState({intent: e.target.value});
	};

	setUtterance = (e) => {
		this.setState({utterance: e.target.value});
	};

	handleFiles = (files) => {
		let reader = new FileReader();
		reader.onload = (e) => {
			// if(window.confirm("Are you sure you want to import?")){
				let result = csvReader.parse(reader.result, {
					header: true,
					encoding: "UTF-8"
				});
				this.imporToLUIS(result);
			// }
		};
		reader.readAsText(files[0]);
	}

	imporToLUIS = async (res) => {
		let csvData = res.data;

		// Maximum LUIS batch import count is 100
		// https://westus.dev.cognitive.microsoft.com/docs/services/5890b47c39e2bb17b84a55ff/operations/5890b47c39e2bb052c5b9c09
		const maxCount = 100;
		let fullCSV_Sliced = [];

		// Chunk array into maxCount
		// https://stackoverflow.com/a/8495740/1802483
		for (let i = 0, j = csvData.length; i < j; i += maxCount) {
			fullCSV_Sliced.push(csvData.slice(i, i + maxCount));
		}

		// each fullCSV_Sliced contains 100 units, index from 0 - 99
		for (let index = 0; index < fullCSV_Sliced.length; index++) {

			let finalUtterance_IntentList = []

			// Loop through each item within fullCSV_Sliced
			for (let i = 0; i < fullCSV_Sliced[index].length; i++) {
				const item = fullCSV_Sliced[index][i];

				if(this.doesIntentExists(item.Intent) === false){
					// If intent NOT exists in LUIS, add Intent first
					await axios.post("/createIntent", {name: item.Intent})
						.then((createIntentRes) => {
							console.log("createIntentRes: ", createIntentRes);
							this.allIntents.push({id: createIntentRes.data.id, name: item.Intent});
						});
				}

				// If intent already exists in LUIS, add Utterance to Intent
				finalUtterance_IntentList.push({
					text: item.Utterance,
					intentName: item.Intent
				});

			}

			await axios.post('/batchAddUtteranceToIntent', {finalUtterance_IntentList})
				.then((resp) => {
					console.log(resp.data);
					return resp.data
				});

		}

	}

	doesIntentExists = (intent) => {
		for (let index = 0; index < this.allIntents.length; index++) {
			if(this.allIntents[index].name === intent){
				return true;
			}
		}
		return false;
	}

	render() {
		return (
			<div className="App">

				<div className="container">
					<div className="row">
						<div className="col-sm-4">Utterance</div>
						<div className="col-sm-4">Intent</div>
						<div className="col-sm-4"></div>
					</div>
					<div className="row">
						<div className="col-sm-4">
							<input className="form-control utterance" type="text" onChange={this.setUtterance} />
						</div>
						<div className="col-sm-4">
							<select className="form-control intent" onChange={this.onChangeSelect}>
								<option key="intent_defualt" value="">Select...</option>
								{this.state.intentOptions.map((obj, i) =>
									<option key={obj.id} value={obj.name}>{obj.name}</option>
								)}
							</select>
						</div>
						<div className="col-sm-4">
							<button className="btn btn-primary" onClick={this.submitToLUIS}>Create</button>
						</div>
					</div>
					<div className="row">
						<ReactFileReader handleFiles={this.handleFiles}
							fileTypes={[".csv"]} base64={false} multipleFiles={false}>
							<button className='btn btn-primary'>Import To LUIS</button>
						</ReactFileReader>
					</div>
				</div>
      		</div>
    	);
  	}
}

export default App;
