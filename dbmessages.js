import mongoose from 'mongoose'

// Data Schema is defined

const whatsappSchema = mongoose.Schema({
    message: String,
    name: String,
    timestamp: String,
    received: Boolean
    
});

export default mongoose.model('messagecontents', whatsappSchema)