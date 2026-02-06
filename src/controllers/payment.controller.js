import {config} from "dotenv";
import { User } from "../models/user.model.js";
import ApiError from "../utils/error.util.js";
import Razorpay from "../utils/razorpay.js";
import crypto from "crypto";
import Payment from "../models/payment.model.js";
config({
    quiet:true,
    path:"./.env"
});

const getRazorpayApiKey =async(req, res, next)=>{

  try {
      return res.status(200).json({
          success:true,
          message:"Razorpay API key",
          key:process.env.RAZORPAY_KEY_ID
      });
    } catch (error) 
    {
        console.error("Error getRazorpayApiKey server : ",error);
        
         return next(new ApiError(error.message,500));
   }
}
const buySubscription =async(req, res, next)=>{
   try {
     const {_id} =req.user;
     
     const user = await User.findById(_id);
     if(!user){
         return next(new ApiError("Unauthorized , please login ",401));
     }
     if(user.role==="ADMIN"){
         return next(new ApiError("Admin cannot purches a subscription",400));
     }
     const subscription = await Razorpay.subscriptions.create({
        plan_id:process.env.RAZORPAY_PLAN_ID,
        customer_notify:1,
        total_count:12
     });

     user.subscription.id= subscription.id;
     user.subscription.status= subscription.status;
 
     await user.save();
 
     return res.status(200)
     .json({
         success:true,
         message:"subscribed successfully",
         subscription_id:subscription.id
     });
   } catch (error) 
   {
        console.error("Error buySubscription server : ",error);
        
         return next(new ApiError(error.message,500));
   }
}
const verifySubscription =async(req, res, next)=>{
   try {
      const {_id} =req.user;
            
      const {razorpay_payment_id,razorpay_signature,razorpay_subscription_id} =req.body;
      if(!razorpay_payment_id || !razorpay_signature ||!razorpay_subscription_id){
         return next(new ApiError("all fileds are raquired  payment verify ",400)); 
      }
     const user = await User.findById(_id);
     if(!user){
         return next(new ApiError("Unauthorized , please login ",401));
     }


     const subscriptionId = await user.subscription.id;
     //check await 
     const generatedSignature = await crypto
        .createHmac("sha256",process.env.RAZORPAY_SECRET)
        .update(`${razorpay_payment_id}|${subscriptionId}`)
        .digest("hex");

        if(generatedSignature !==razorpay_signature){
            return next(new ApiError("Payment not verified please try again",500));
        }
        const payment = await Payment.create({
            razorpay_payment_id,
            razorpay_signature,
            razorpay_subscription_id
        });
        if(!payment){
            return next(new ApiError("Payment not create successfully ",500))
        }

        user.subscription.status="active";
        await user.save();

        return res.status(200)
        .json({
            success:true,
            message:"Payment verified and created successfully",

        });

   } catch (error)
    {
         console.error("Error verifySubscription server : ",error);
        
         return next(new ApiError(error.message,500));    
   }
}
const cancelSubscription =async(req, res, next)=>{
   try {
        const {_id} =req.user;
    
        const user = await User.findById(_id);
        if(!user){
            return next(new ApiError("Unauthorized , please login ",401));
        }
        if(user.role==="ADMIN"){
            return next(new ApiError("Admin cannot purches a subscription",400));
        }
        const subscriptionId = user.subscription.id;
        const subscription = await Razorpay.subscriptions.cancel(subscriptionId);
        user.subscription.status = subscription.status;
        await user.save();
        return res.status(200)
            .json({
                success:true,
                message:"Subscription cancel successfully"
            })
    }
    catch (error){
        console.error("Error cancelSubscription server : ",error);
        
        return next(new ApiError(error.message,500));  
    }


}
const allPayments =async(req, res, next)=>{
    try {
        const {count } = req.query;

        const allSubscription = await Razorpay.subscriptions.all({
            count:count || 10
        });
        //const payments = 

        return res.status(200)
            .json({
                success:true,
                message:"All payments fetch successfully",
                allSubscription
        }); 
        
    } 
    catch (error) {
        console.error("Error all payment server : ",error);
        
        return next(new ApiError(error.message,500));
    }
}

export {
    getRazorpayApiKey,
    buySubscription,
    verifySubscription,
    cancelSubscription,
    allPayments,
}