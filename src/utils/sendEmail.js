import { config } from "dotenv";
config({
    quiet:true,
    path:"./.env"
})
import nodemailer from "nodemailer";

 const sendEmail = async (email, subject, message) =>{

    try {
        const transporter = nodemailer.createTransport({
           service:"gmail",   //OR
            // host:process.env.SMTP_HOST||"smtp.ethereal.email",
            // port:process.env.SMTP_PORT||587,
            //secure:false,

            auth:{
                //user:process.env.SMTP_USERNAME||"maddison53@ethereal.email",  //"testing",
                //pass:process.env.SMTP_PASSWORDS|| "jn7jnAPss4f63QBp6D",  //"password"
                /**
                 * OR
                 */
              user:process.env.SMTP_FROM_EMAIL,  //MAIN ACCOUNT,
              pass:process.env.SMTP_PASSWORD,//|| "jn7jnAPss4f63QBp6D",  //"password"
            },

        });
        const info =await transporter.sendMail({
            from: process.env.SMTP_FROM_EMAIL,//|| "smtp_from_email",
            to: email,
            subject: subject,
            html: message
 
        });
        return info;        
        
    } 
    catch (error) {
        console.log("Error email utill : ",error);         
        
        return null;
        
    }
}
export default sendEmail;