import { config } from 'dotenv';
import ApiError from '../utils/error.util.js';
import {User} from "../models/user.model.js"
import { destroyFile, uploadOnCloudinary } from '../utils/cloudinary.js';
import bcrypt from 'bcryptjs';
import crypto from "crypto";
import sendEmail from '../utils/sendEmail.js';
import fs from "fs"


config({
    quiet: true,
    path:"./.env"
});
const option = {
   maxAge: 2*60*60*1000*24,
    httpOnly:true,
    secure:true,
    sameSite: "none"    
}

const register = async (req,res , next) =>{
    try {
                
        const {fullName,email,password} = req.body;    
        if(!fullName ||!email ||!password){
            return next(new ApiError('All fields are required',400));
        }
        const fileName = req.file.buffer;
        const fileType = req.file.mimetype;
        //console.log("file : ",req.file);
        
        const userExists = await User.findOne({email});
                
        if(userExists){
            //fs.unlinkSync(path);
            return next(new ApiError("Email already exists ",400));
        }            
       
        if(!fileName){
            return next(new ApiError(400, "Avatar file is missing"));
        }
        const avatar = await uploadOnCloudinary(fileName,fileType );       
    
        if (!avatar?.url) {
            return next(new ApiError( "Error while uploading on avatar ",400))
        }
               
        const user =await User.create({
            fullName, email,password,avatar:
            {
                public_id:avatar.public_id,
                secure_url:avatar.secure_url
            }
        });       
        if (!user) {           
            return next(new ApiError("User registation failed , please try again",400));
        }
       // await user.save({validateBeforeSave:false});
        //const token = user.generateToken();
    
        user.password = undefined;
        return res.status(200).json({
            success:true,
            message: "User register successfully ",
            user
        });

    } catch (error) {
        console.error("Register/signup error on server ",error);
        
         return next(new ApiError(error.message,500));
        
    }
}
const login = async (req,res, next) =>{
   try {
        const {email,password} = req.body;
        if(!email ||!password){
            return next(new ApiError("All fiels are required" , 400));
        }
        const user =await User.findOne({email}).select("+password");       
    
        if (!(user && (await bcrypt.compare(password , user.password)))) {
            return next(new ApiError("Email and password does not match", 400));
        }
        const token = await user.generateToken();       
               
        user.password= undefined;
        
        return res.status(200)
        .cookie("token",token,option)
        .json({
            success:true,
            message:"User login successfully",
            user
        });
   } catch (error) {
        return next(new ApiError(error.message,500));
   }

}
const logout = async (req,res) =>{


  try 
    {
        const option = {
                httpOnly:true,
                secure:true,
                maxAge:0,
        }
     return res.status(200).
      clearCookie("token",option)
      .json({
          success:true,
          message:"User logged out successfully"
      });
    } 
    catch (error) {
         return next(new ApiError(error.message,500));
    
    }
}
const getProfile = async (req,res,next) =>{
  try {

      const userId= req.user._id;     
      
      const user = await User.findById(userId);    
     return res.status(200)
      .json({
        success:true,
        message:"Fetch data successfully",
        user
      });
  } catch (error) {
    return next(new ApiError(error.message,500));
  }
}

const forgotPassword = async (req, res) => {
    
        const {email} = req.body;
        if(!email){
            return next(new ApiError("Email is required ",400))
        }
        const user = await User.findOne({email});

        if(!user){
            return next(new ApiError("Email not register ",400));
        }

        const resetToken = user.generatePasswordResetToken();

        await user.save({validateBeforeSave: false});

        const resetPasswordUrl = `${process.env.FRONTEND_UR}/reset_password/${resetToken}`;

       // console.log(resetPasswordUrl);
        
        const subject = "Reset password ";
        const message = `You con reset password by clicking <a href=${resetPasswordUrl} target ="_blank" >Reset your password </a>\nIf the above link does not work for reason then copy paste  this link new tab ${resetPasswordUrl}.\n  If you have not requested this , kindly ignore .`
        try {
        await sendEmail(email, subject, message);

       return res.status(200)
        .json({
            success:true,
            message:`Reset password token has been send to ${email} successfully`
        })
        
    } catch (error) {
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;
        await user.save({validateBeforeSave:false});
        return next(new ApiError(error.message,500))
    }
}
const resetPassword = async (req,res,next) => {
    try {
        const {resetToken} = req.params;

        const {password} = req.body;

        const forgotPasswordToken = await crypto
                .createHash("sha256")
                .update(resetToken)
                .digest("hex");

        const user = await User.findOne({
            forgotPasswordToken,
            forgotPasswordExpiry:{$gt:Date.now()}
        });

        if(!user){
            return next(new ApiError("Token is invalid or expired, please try again.",400));
        }
        user.password=password;
        user.forgotPasswordExpiry = undefined;
        user.forgotPasswordToken = undefined;
        await user.save({validateBeforeSave:false});

        return res.status(200)
        .json({
            success:true,
            message:"Password changed successfully "
        });

    } catch (error) {
        return next(new ApiError(error.message,500));
    }
}
const chagePassword = async(req, res,next) =>{
    try {
        const {oldPassword,newPassword} = req.body;        

        if(!oldPassword || !newPassword){
            return next(new ApiError("All fields are required ",400));
        }
        const user = await User.findById(req.user?._id).select("+password");
        if(!user){
            return next(new ApiError("User does nit exist ",400));

        }
        const isPasswordValid = await user.comparePassword(oldPassword);

        if(!isPasswordValid){
            return next(new ApiError("Invalid old password "));
        }
        user.password= newPassword;
        await user.save({validateBeforeSave:false});
        user.password= undefined

        return res.status(200).json({
            success:true,
            message: "Password changed successfully"
        })
        
    } catch (error) {
        return next(new ApiError(error.message,500));
    }
}
const updateUser = async(req,res,next) =>{
    try 
    {
        const {fullName} = req.body;
       
        const {id} =req.params;
       
         const fileName = req.file.buffer;
        const fileType = req.file.mimetype;
        //console.log("file : ",req.file);   
        const user = await User.findById(id);
        if(fullName){
        user.fullName= fullName;
        }
       
        if(fileName)
        {          
            const avatar =await uploadOnCloudinary(fileName, fileType);
                        
            if(!avatar?.url){
                return next(new ApiError("Error while uploading  on cloudinary",500))
            }
            const resp = await destroyFile(user.avatar.public_id);
            //console.log("update : ",resp);
            
            user.avatar.public_id= avatar.public_id;
            user.avatar.secure_url = avatar.secure_url;
        }  

        await user.save({validateBeforeSave:false});
        return res.status(200).json({
            success:true,
            message:"User datails updated successfully "
        });
       
    } 
    catch (error) {
        console.log("error ",error);
        
        return next(new ApiError(error.message,500));
    }
}

export {
    register,
    login,
    logout,
    getProfile,
    forgotPassword,
    resetPassword,
    chagePassword,
    updateUser,
}