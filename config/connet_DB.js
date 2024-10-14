import mongoose from "mongoose";

//Here we define the connect_db function and call in app.js
async function connect_db() {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
        console.log("<---MongoDB Database connected successfully--->");
    } catch (error) {
        console.log(error);
    }

}

export default connect_db