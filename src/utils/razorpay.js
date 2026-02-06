import { config } from "dotenv";
config({
    quiet:true,
    path:"./.env"
})
import Razorpay from "razorpay";

const razorpay = new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_SECRET
});

export default razorpay;