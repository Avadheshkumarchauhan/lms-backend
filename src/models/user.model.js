import{config} from "dotenv";
config({path:"./.env",
    quiet:true
});
import {Schema, model} from 'mongoose';

import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema({

    fullName:{
        type: 'String',
        required:[true,'Name is required'],
        minLenght:[5,'Name must be at least 5 characters'],
        maxLenght:[50,'Name must be at least 50 characters'],
        lowercase:true,
        trim:true
    },
    email:{
        type:'String',
        required:[true,'email is required'],
        lowercase:true,
        trim:true,
        unique:true,
       // match:[]
    },
    password:{ 
        type:String,
        required:[true,'email is required'],
        minLenght:[8,'password must be at least 8 characters'],
        select:false
    },
    avatar:{
        public_id:{
            type:'string'
        },
        secure_url:{
            type:'string'
        }
    },
    role:{
        type:'String',
        enum:['USER','ADMIN'],
        default:'USER'
    },
    forgotPasswordToken:{
        type:'String'
    },
    forgotPasswordExpiry:{
        type:Date
    },
    subscription:{
        id:String,
        status:String
    }

},{
    timestamps: true
}
);
userSchema.pre("save", async function () {
    if(!this.isModified("password")){
        return ; //check
    }
    this.password = await bcrypt.hash(this.password, 10);
    // check
   });
userSchema.methods =  {
    generateToken(){
        return jwt.sign(
            {_id:this._id,email:this.email,role:this.role},
            process.env.JWT_SECRET,
            {expiresIn:process.env.JWT_EXPIRY}

        )
    },
}
userSchema.methods.comparePassword = async function (password) {

    return await bcrypt.compare(password, this.password);

}

userSchema.methods.generatePasswordResetToken = async function() {

    const resetToken = await crypto.randomBytes(20).toString("hex");
    
    this.forgotPasswordToken =await crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex")

    this.forgotPasswordExpiry = Date.now() +(15 * 60 * 1000);

    return resetToken;
}





export const User =  model('User',userSchema);