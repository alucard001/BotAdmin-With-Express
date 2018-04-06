// https://esausilva.com/2017/11/14/how-to-use-create-react-app-with-a-node-express-backend-api/
const LUIS = require('./luis_api/luis')

const express = require('express')

const app = express();
const port = process.env.PORT || 5000

const bodyParser = require("body-parser")

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// https://scotch.io/tutorials/use-expressjs-to-get-url-and-post-parameters
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.get("/getLUISIntent", async (req, res) => {
    let intents = await LUIS.axiosInstance.get('/intents')
                    .then((resp) => {
                        return resp.data
                    });
    res.send({ intents });
});

app.post("/createIntent", async (req, res) => {
    let data = {name: req.body.name}
    // console.log("createIntent", data)
    let result = await LUIS.axiosInstance.post('/intents', data)
                    .then((resp) => {
                        return resp.data
                    });
    res.send({ "id": result });
});

app.post("/batchAddUtteranceToIntent", async (req, res) => {
    // console.log("batchAddUtteranceToIntent", { finalUtterance_IntentList: req.body.finalUtterance_IntentList })

    let data = req.body.finalUtterance_IntentList;

    let result = await LUIS.axiosInstance.post('/examples', data)
                    .then((resp) => {
                        return resp.data
                    });
    res.send({ result });
});

app.post('/addUtteranceToIntent', async (req, res) => {
    let data = {
        text: req.body.text,
        intentName: req.body.intentName
    };

    let result = await LUIS.axiosInstance.post('/example', data)
                    .then((resp) => {
                        return resp.data
                    });
    res.send({ result });
});

app.listen(port, () => {
    console.log(`Listening to port ${port}`)
})