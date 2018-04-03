// https://esausilva.com/2017/11/14/how-to-use-create-react-app-with-a-node-express-backend-api/
const LUIS = require('./luis_api/luis')

const express = require('express')

const app = express();
const port = process.env.PORT || 5000

app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.get("/getLUISIntent", async (req, res) => {
    let intents = await LUIS.axiosInstance.get('/intents')
                    .then((resp) => {
                        return resp.data
                    });
    res.send({ intents });
});

app.post('/addUtteranceToIntent', async (req, res) => {
    console.log("req.params: ", req.params);

    // let result = await LUIS.axiosInstance.post('/example')
    //                 .then((resp) => {
    //                     return resp.data
    //                 });
    // res.send({ result });
});

app.listen(port, () => {
    console.log(`Listening to port ${port}`)
})