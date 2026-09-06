import mongoose , {schema} from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    subscriber: {    //sbc=scribe kerne wala
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    channel:{       //kis channel ko subscribe kiya hai
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
},
{timestamps:true});

export default mongoose.model('Subscription', subscriptionSchema);