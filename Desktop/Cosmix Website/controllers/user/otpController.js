// const OTP = require('../models/otpModel');
// const User = require('../models/userModel');
// const { generateOtp } = require('../utils/otpUtils');
// const { sendVerificationEmail } = require('../utils/emailUtils');

// exports.sendOTP = async (req, res) => {
//   try {
//     const { email } = req.body;

//     // Check if user already exists (optional depending on your requirements)
//     const checkUserPresent = await User.findOne({ email });
//     if (checkUserPresent) {
//       return res.status(409).json({
//         success: false,
//         message: 'User is already registered',
//       });
//     }

//     // Generate OTP
//     const otp = generateOtp();

//     // Save OTP to the database
//     await OTP.create({ email, otp });

//     // Send OTP via email
//     const emailSent = await sendVerificationEmail(email, otp);
//     if (!emailSent) {
//       return res.status(500).json({
//         success: false,
//         message: 'Failed to send OTP email',
//       });
//     }

//     // Respond with success
//     res.status(200).json({
//       success: true,
//       message: 'OTP sent successfully',
//     });
//   } catch (error) {
//     console.error('Error in sending OTP:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error',
//       error: error.message,
//     });
//   }
// };
