const React = require("react")
const axios = require("axios")

// Load .env config
const dotenv = require('dotenv').config();

class Luis extends React.Component {
    constructor(props) {
        super(props);
        // console.log(process.env);
        // process.env did not work here, don't know why
        const app_id = process.env.LUIS_APP_ID;
        const version = process.env.LUIS_VERSION;
        const subscription_key = process.env.LUIS_SUBSCRIPTION_KEY;

        this.axiosInstance = axios.create({
            baseURL: `https://westus.api.cognitive.microsoft.com/luis/api/v2.0/apps/${app_id}/versions/${version}`,
            headers: {
                "Content-Type": 'application/json',
                "Ocp-Apim-Subscription-Key": subscription_key
            }
        });
        // console.log(this.axiosInstance);
    }
}

module.exports = new Luis();