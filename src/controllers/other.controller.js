import { config } from "dotenv";
config({
    quiet:true,
    path:"./.env"
});
import ApiError from "../utils/error.util.js";
import sendEmail from "../utils/sendEmail.js";
import { User } from "../models/user.model.js";

const contactUs = async(req,res,next)=>{

  try {
      const {name,email,message}=req.body;
            
      if(!name ||!email ||!message){
          return next(new ApiError("All fields are required"));
        }

        const subject ="Contact Us Form ";
        const textMessage=`<h1>Name : ${name} <br/>Email :  ${email} <br/>Message : ${message}</h1>`;

       const response= await sendEmail(process.env.CONTACT_US_EMAIL,subject,textMessage);
       if(!response?.accepted){
        return next(new ApiError("Email not accepted",500));
       }
       

        return res.status(200)
            .json({
                success:true,
                message:"Your request has been submitted successfully "
            });
    } 
    catch (error) {
        console.log(" Contect us server error : ",error);
        return next(new ApiError(error.message,500));        
        
    }
}
const userStats =async (req,res,next) =>{
  try {
      const allUsersCount= await User.countDocuments();
  
      const subscriptionUsersCount= await User.countDocuments({
          'subscription.status':'active',
      });     

      return res.status(200).
        json({
            success:true,
            message:"All registered users count ",
            allUsersCount,
            subscriptionUsersCount
        })
  
    } 
    catch (error) {
         console.log(" userStats  server error : ",error);
        return next(new ApiError(error.message,500));    
    }
}



export{
    contactUs,
    userStats
}