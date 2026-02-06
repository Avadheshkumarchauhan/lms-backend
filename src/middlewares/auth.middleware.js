import { config } from "dotenv";
config({
    path:"./.env",
    quiet:true
    
});
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/error.util.js";



export const isLoggedIn = async (req, res, next) =>{
   try {
     const token = req.cookies && req.cookies?.token || req.header("Authorization")?.replace("Bearer ", "");
              
     if(!token){
         return next( new ApiError("Unauthenticated user , please login try agin ", 401));
     }
          
     const userDetail = await jwt.verify(token,process.env.JWT_SECRET);
             
     req.user = userDetail;

     next();

   } catch (error) {
    return next(new ApiError(error.message,400));
    
   }
   
}
export const authorizedRoles = (...roles) =>async (req, res, next) =>{
try {const user = await User.findById(req.user._id);
    
    const currentUserRole = user.role;    

    if(!roles.includes(currentUserRole)){
       return next(new ApiError("You do not have permission to access this route ",403));
    }
    next();
    } catch (error) {
        return next(new ApiError(error.message,500)); 
    }
}
export const authorizeSubscriber =async ( req,res,next)=>{
    try {
        const user = await User.findById(req.user._id);
       
        if(user.role !=="ADMIN" && user.subscription.status !=="active"){
            return next(new ApiError("Please subscribe to access this route ",403));
        }
        next();

        
    } catch (error) {
         return next(new ApiError(error.message,500)); 
        
    }

}