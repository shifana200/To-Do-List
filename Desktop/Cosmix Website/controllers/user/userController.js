const User = require('../../models/userSchema')
const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt');
const env = require('dotenv').config();
const sendOTP = require('../../utils/mailSender')
const hashPassword = require('../../utils/hashPassword')


const pageNotFound = async (req, res) => {
    try {
        res.render('page-404')
    } catch (error) {
        res.redirect('/pageNotFound')   
    }
}

const loadHomepage = async (req, res) => {
    try {
        return res.render('home')
    } catch (error) {
        console.log("Home page not found")
        res.status(500).send("Server not found")
    }
}

const loadSignIn = async (req, res) => {
    try {
        return res.render('signin')
    } catch (error) {
        console.log("Signin page not loading", error)
        res.status(500).send('Server error')
    }
}

const loadSignUp = async (req, res) => {
    try {
        return res.render('signUp')
    } catch (error) {
        console.log("Register page not loading", error)
        res.status(500).send('Server error')
    }
}


// OTP Generation
function generateOtp() {

    return Math.floor(100000 + Math.random() * 900000).toString()
    
}


//Send OTP 

async function sendVerificationEmail(email, otp) {
    try {

        const transporter = nodemailer.createTransport({
            service: "gmail",
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: process.env.NODEMAILER_EMAIL,
                pass: process.env.NODEMAILER_PASSWORD,
                // user:"yasinputhiyara@gmail.com",
                // pass:"tteb fuqd yeug qtpu"
            }


        })

        const info = await transporter.sendMail({
            from: process.env.NODEMAILER_EMAIL,
            // from:"yasinputhiyara@gmail.com",
            to: email,
            subject: "Verify your account",
            text: `Your OTP is ${otp}`,
            html: `<b> Your OTP ${otp} </b>`
        })

        return info.accepted.length > 0

    } catch (error) {
        console.error("Error sending email", error)
        return false

    }
}

// -----
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10)
        return passwordHash


    } catch (error) {

    }
};


const verifyRegister = async (req,res)=>{

    try {
        const {username ,email, password } = req.body

    const existingUser = await User.findOne({email})
    if(existingUser){
        res.render('/signUp',{error:"User already exist"})
    }else{
        const otp = generateOtp()

        const emailSent = await sendVerificationEmail(email, otp)
        if (!emailSent) {
            return res.json('email-error')
        }

        req.session.userOtp = otp
        req.session.userData = { username, email, password }
        
        console.log(req.session.userData);

        res.redirect('/verify')
        console.log("OTP Sent ", otp)
    }
    } catch (error) {
        console.error("Signup Error", error);
        res.status(500).send("Internal Server Error");
        
    }

    
}


const loadOtpPage = async (req,res)=>{
    res.render('verify-otp')
}

// const verifyOtp = async (req,res)=>{
//     try {
//         const { otp } = req.body;

//         console.log('Provided OTP:', otp);
//         console.log('Session Data:', req.session);

//         if (otp === req.session.userOtp) {
//             const user = req.session.userData;
//             console.log('Verify - otp user:', user);

//             const passwordHash = await securePassword(user.password);
//             console.log('Password Hash:', passwordHash);

//             const saveUserData = new User({
//                 username: user.username,
//                 email: user.email,
//                 password: passwordHash
//             });

//             try {
//                 await saveUserData.save();
//                 console.log('User Saved Successfully:', saveUserData);
//             } catch (error) {
//                 console.error('Error Saving User:', error);
//                 return res.status(500).json({ success: false, message: "Error saving user" });
//             }

//             req.session.user = saveUserData._id;
//             console.log('Session User:', req.session.user);

//             return res.json({ success: true, redirectUrl: "/login" });
//         } else {
//             console.error('Invalid OTP');
//             return res.status(400).json({ success: false, message: "Invalid OTP, please try again" });
//         }

//     } catch (error) {
//         console.error('Error Verifying OTP:', error);
//             return res.status(500).json({ success: false, message: "An error occurred" });
        
//     }
// }

const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;

        // Log OTPs for debugging
        console.log('Provided OTP:', otp);
        console.log('Session OTP:', req.session.userOtp);

        // Compare provided OTP with the stored OTP in the session
        if (otp === req.session.userOtp) {
            const user = req.session.userData;
            console.log('Verify - otp user:', user);

            // Hash the password before saving the user
            const passwordHash = await securePassword(user.password);
            console.log('Password Hash:', passwordHash);

            // Create new user with hashed password
            const saveUserData = new User({
                username: user.username,
                email: user.email,
                password: passwordHash
            });

            // Save user to database
            await saveUserData.save();
            console.log('User Saved Successfully:', saveUserData);

            // Clean session data
            req.session.userOtp = null;
            req.session.userData = null;

            // Store user ID in session and respond with success
            req.session.user = saveUserData._id;
            console.log('Session User:', req.session.user);

            return res.json({ success: true, redirectUrl: "/" });
        } else {
            // If OTP doesn't match
            console.error('Invalid OTP');
            return res.status(400).json({ success: false, message: "Invalid OTP, please try again" });
        }

    } catch (error) {
        console.error('Error Verifying OTP:', error);
        return res.status(500).json({ success: false, message: "An error occurred" });
    }
};






const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Input validation
        if (!name || !email || !password) {
            return res.status(400).send('All fields are required');
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('Email is already registered');
        }

        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Hash the password before storing
        const hashedPassword = await hashPassword(password);

        // Save the user (without OTP expiration)
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            otp,
            otpExpiration: Date.now() + 10 * 60 * 1000 // OTP expires in 10 minutes
        });

        await newUser.save();

        // Send OTP to user email
        await sendOTP(email, otp);

        // Redirect to OTP verification page
        res.redirect('/verify');
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send('Internal Server Error');
    }
};

// const verifyOTP = async (req, res) => {
//     try {
//         const { email, otp } = req.body;

//         // Find the user by email
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(400).send('User not found');
//         }

//         // Check if OTP matches and is still valid
//         if (user.otp !== otp) {
//             return res.status(400).send('Invalid OTP');
//         }

//         if (Date.now() > user.otpExpiration) {
//             return res.status(400).send('OTP expired');
//         }

//         // OTP verified, remove OTP and expiration
//         user.otp = undefined;
//         user.otpExpiration = undefined;

//         // Save the user data
//         await user.save();

//         // Redirect to homepage after OTP verification
//         res.redirect('/home');
//     } catch (err) {
//         console.error('Error during OTP verification:', err);
//         res.status(500).send('Internal Server Error');
//     }
// };



// function generateOtp() {
//     return Math.floor(100000 + Math.random() * 900000).toString();
// }

// async function sendVerificationEmail(email, otp) {
//     try {
//         const transporter = nodemailer.createTransport({
//             service: 'gmail',
//             port: 587,
//             secure: false,
//             requireTLS: true,
//             auth: {
//                 user: process.env.NODEMAILER_EMAIL,
//                 pass: process.env.NODEMAILER_PASSWORD,
//             },
//         });

//         const info = await transporter.sendMail({
//             from: process.env.NODEMAILER_EMAIL,
//             to: email,
//             subject: 'Verify your Account',
//             text: `Your OTP is ${otp}`,
//             html: `<b>Your OTP : ${otp}</b>`,
//         });

//         return info.accepted.length > 0;
//     } catch (error) {
//         console.error('Error sending email', error);
//         return false;
//     }
// }

// const signUp = async (req, res) => {
//     try {
//         const { name, phone, email, password, confirmPassword } = req.body;
//         if (password !== confirmPassword) {
//             return res.render("signup", { message: "Passwords do not match" });
//         }

//         const findUser = await User.findOne({ email });
//         if (findUser) {
//             return res.render("signup", { message: "User with this email already exists" });
//         }

//         const otp = generateOtp();
//         const emailSent = await sendVerificationEmail(email, otp);

//         if (!emailSent) {
//             return res.json("Email error");
//         }

//         req.session.userOtp = otp;
//         req.session.userData = { name, phone, email, password };
//         res.render("verify-otp");
//         console.log("OTP Sent", otp);
//     } catch (error) {
//         console.error("Signup error", error);
//         res.redirect("/pageNotFound")
//     }
// }

// // const securePassword = async (password) => {
// //     try {
// //         const passwordHash = await bcrypt.hash(password, 10)
// //         return passwordHash;
// //     } catch (error) {
// //         console.error("Error securing password", error);
// //     }
// // }

// // const verifyOtp = async (req, res) => {
// //     try {
// //         const { otp } = req.body;

// //         if (otp === req.session.userOtp) {
// //             const user = req.session.userData;
// //             const passwordHash = await securePassword(user.password);
// //             const saveUserData = new User({
// //                 name: user.name,
// //                 email: user.email,
// //                 phone: user.phone,
// //                 password: passwordHash,
// //             });

// //             await saveUserData.save();
// //             req.session.user = saveUserData._id;
// //             res.json({ success: true, redirectUrl: "/" });
// //         } else {
// //             res.status(400).json({ success: false, message: "Invalid OTP, please try again" });
// //         }
// //     } catch (error) {
// //         console.error("Error verifying OTP", error);
// //         res.status(500).json({ success: false, message: "An error occurred" });
// //     }
// // }

module.exports = {
    loadHomepage,
    pageNotFound,
    loadSignIn,
    loadSignUp,
    registerUser,
    verifyOtp,
    verifyRegister,
    loadOtpPage,
}
