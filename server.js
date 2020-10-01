// importing 
import express from 'express'
import mongoose from 'mongoose'
import Messages from './dbmessages.js'
import Pusher from 'pusher'
import cors from 'cors'
//app config
const app = express()
const port = process.env.PORT || 9000
// middlewares
app.use(express.json())
app.use(cors())

//DB config
const connectionurl = 'mongodb+srv://admin:eChE7edC68TXOMt2@cluster0.dxcps.mongodb.net/whatsappdb?retryWrites=true&w=majority'
mongoose.connect(connectionurl, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
//??
var pusher = new Pusher({
    appId: '1069694',
    key: 'd3e0c0072195dda93b55',
    secret: '65530721ad344d8d7fa8',
    cluster: 'ap4',
    encrypted: true,
    
  });

const db = mongoose.connection
db.once('open',()=>{
    console.log('DB connected')
    const msgCollection = db.collection('messagecontents')
    const changeStream = msgCollection.watch()

    changeStream.on('change',(change)=>{
        
        if(change.operationType === 'insert'){
            const messageDetail = change.fullDocument;
            pusher.trigger('messages', 'inserted', {
                
                    name : messageDetail.name,
                    message: messageDetail.message,
                    timestamp: messageDetail.timestamp,
                    received: messageDetail.received
                }

            );
        }else{
            console.log('Error triggering pusher')
        }

    });
});



//API routes
app.get('/',(req,res)=>res.status(200).send('hello world'))

app.get('/messages/sync',(req,res)=>{
    Messages.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

app.post('/messages/new',(req,res)=>{
    const dbmessage = req.body

    Messages.create(dbmessage,(err,data)=>{
        if(err){
            //internal server error
            res.status(500).send(err)
        }else{
            // created ok
            res.status(201).send(`new message created: \n ${data}`)
        }
    })
})


//listener
app.listen(port, () => console.log(`Lisenting localhost:${port}`))