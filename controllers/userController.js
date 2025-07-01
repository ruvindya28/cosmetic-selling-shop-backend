import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import dotenv from "dotenv";
import axios from "axios";
import nodemailer from "nodemailer";
import Otp from "../models/otp.js";
dotenv.config();

 const transport = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: "sachiniruvindya@gmail.com",
        pass:"nyaznoykfskxrotk"
    }
});


export function saveUser(req,res){

    if (req.body.role=='admin'){
        if(req.user==null){
            res.status(403).json({
                message:"please login as admin before creating an admin account"
            })
            return;
        }
        if(req.user.role!='admin'){
            res.status(403).json({
                message:"You are not authorized to create an admin account"
            })
            return;
        }
    }

    const hashedPassword = bcrypt.hashSync(req.body.password , 10);
    const user = new User({
        email : req.body.email,
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        password : hashedPassword,
        role: req.body.role,
    })

    user.save().then(()=>{
        res.json({
            message : "User saved successfully"
        })
    }).catch(()=>{
        res.status(500).json({
            message : "User not saved"
        })
    })
}

//get all users

export async function getAllUsers(req, res) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
    }

    try {
        const users = await User.find({}, '-password'); 
        res.json(users);
    } catch (e) {
        res.status(500).json({ message: "Failed to fetch users" });
    }
}

// delete user

export async function deleteUser(req, res) {
    const userId = req.params.userId;

    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
    }

    try {
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User deleted successfully" });
    } catch (e) {
        res.status(500).json({ message: "Error deleting user" });
    }
}

// login user

export function loginUser(req,res){

    const email= req.body.email;
    const password = req.body.password;

    User.findOne({
        email : email

    }).then((user)=>{
       if(user==null){
        res.status(404).json({
            message:"Invalid Email"
        })
       }else{
        const isPasswordCorrect = bcrypt.compareSync(password,user.password)

        if(isPasswordCorrect){
            
            const userData={
                email : user.email,
                firstName : user.firstName,
                lastName : user.lastName,
                role : user.role,
                phone:user.phone,
                isDisabled:user.isDisabled,
                isEmailVerified:user.isEmailVerified,
            }

            console.log(userData)
               
            const token = jwt.sign(userData,process.env.JWT_KEY,{
                expiresIn:"48hrs"
            });  
             
            res.json({
                message:"Login Successfull",
                token:token,
                user:userData
            })

        }else{
            res.status(403).json({
                message:"Invalid Password"
            })
        }

       }
    })
}
       
export async function googleLogin(req, res) {
    const accessToken = req.body.accessToken;

    try {
        const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
               Authorization: "Bearer " + accessToken
 
            }
        });

        const user =await User.findOne({
           email : response.data.email 
        })

        if(user==null){
          
            const newUser = new User({
                email : response.data.email,
                firstName : response.data.given_name,
                lastName : response.data.family_name,
                role:"user",
                isEmailVerified:true,
                password: accessToken
            })
           
            await newUser.save()
             const userData={
               email : response.data.email,
               firstName : response.data.given_name,
               lastName : response.data.family_name,
               role : "user",
               phone:"Not Given",
               isDisabled:false,
               isEmailVerified:true,
            }

           
               
            const token = jwt.sign(userData,process.env.JWT_KEY,{
                expiresIn:"48hrs"
            }); 
             
            res.json({
                message:"Login Successfull",
                token:token,
                user:userData
            })

        }else{
           const userData={
                email : user.email,
                firstName : user.firstName,
                lastName : user.lastName,
                role : user.role,
                phone:user.phone,
                isDisabled:user.isDisabled,
                isEmailVerified:user.isEmailVerified,
            }
            console.log(userData)
               
           const token = jwt.sign(userData,process.env.JWT_KEY,{
                expiresIn:"48hrs"
            }); 
             
            res.json({
                message:"Login Successfull",
                token:token,
                user:userData
            }) 
        }
        
    }
    catch(e){
        res.status(500).json({
            message : "Google login failed" 
        })
        return;
    }
}

export function getCurreentUser(req,res){
      if(req.user==null){
        res.status(403).json({
            message:"You need to login first"
        })
        return;
      }
      res.json(
        {
            user : req.user
        }
      )
}

export function sendOtp(req,res){
    const email = req.body.email;
    const otp = Math.floor(Math.random() * 9000 + 1000); 

    const message= {
        from: "sachiniruvindya@gmail.com",
        to:email,
        subject:"OTP for email verification",
        text:'Your OTP is: ' + otp
    }
    
    const newOtp = new Otp({
        email: email,
        otp: otp
    });

    newOtp.save().then(() => {
        console.log("OTP saved successfully");
    }
);

    transport.sendMail(message, (error, info) => {
        if (error) {
            console.log("Error sending email:", error);
            res.status(500).json({ message: "Failed to send OTP" });
        } else {
            console.log("Email sent:", info.response);
            res.json({ message: "OTP sent successfully", otp: otp });
        }
    });
}

export async function changePassword(req,res){
    const email = req.body.email;
    const otp = req.body.otp;
    const password= req.body.password;
    try{
        const lastOtpData= await Otp.findOne({ 
            email: email, 
             
        }).sort({createdAt: 1})
        if(lastOtpData==null){
            res.status(404).json({
                message:"No OTP found for this email"
            })
            return;
        }
        if(lastOtpData.otp!=otp){
            res.status(400).json({
                message:"Invalid OTP"
            })
            return;
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        await User.updateOne({ 
            email: email }, 
            {
             password: hashedPassword  }
        )
        await Otp.deleteMany({
            email: email})
        res.json({
            message: "Password changed successfully"
        })

    }catch(e){
        res.status(500).json({
            message:"Error fetching OTP"
        })
        return;
    }
    }
