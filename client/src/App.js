import React, { Component } from 'react';
import axios from 'axios';

import './App.css';

class App extends Component {

	constructor(props) {
		super(props);

		this.state = {
			intentOptions: [],
			utterance: '',
			intent: ''
		};

		this.axiosInstance = axios.create({
			baseURL: 'http://localhost:5000'
		});
	}

	componentWillMount = () => {
	}

	componentDidMount = () => {
		return this.axiosInstance.get("/getLUISIntent")
				.then((res) => {
					// console.log(res.data);
					this.setState({
						intentOptions: res.data.intents
					})
				})
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
						return resp.data
					});
			// this.axiosInstance.post('/example', json)
			// 	.then((res) => {
			// 		console.log(res.data);
			// 	});
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
				</div>

      		</div>
    	);
  	}
}

export default App;
