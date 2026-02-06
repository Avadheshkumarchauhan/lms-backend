import dotenv from 'dotenv'
dotenv.config({quiet:true});
import connectDB from './src/dbs/user.db.js'
import app from'./src/app.js';
const PORT = process.env.PORT ||5000;
const HOSTNAME = process.env.HOSTNAME ;
try {    
      await connectDB();
        app.listen(PORT,async()=>{
           
            console.log(`Server is running at http://${HOSTNAME}:${PORT}`);
            
        });
} catch (error) {
    console.log("Error on server file ",error);
    
    
}

