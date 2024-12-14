// const mongoose = require('mongoose');
// const {Schema} = mongoose;

// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required:true,
//         trim: true,
//       },
//       email: {
//         type: String,
//         required:true,
//         unique: true,
        
//       },
//       password: {
//         type: String,
//         required:true,
//       },
//       phone: {
//         type: String,
//         required: true,
//       },
//       googleId: {
//         type:String,
//         required:false
//       },
//       isBlocked: {
//         type: Boolean,
//         default: false
//       },
//       isAdmin: {
//         type: Boolean,
//         default:false
//       },
//       cart: [{
//         type: Schema.Types.ObjectId,
//         ref:"Cart",
//       }],
//       wallet:[{
//         type: Schema.Types.ObjectId,
//         ref:"Wishlist",
//       }],
//       orderHistory:[{
//         type: Schema.Types.ObjectId,
//         ref:"Order",
//       }],
//       createdOn:{
//         type:Date,
//         default: Date.now,
//       },
//       referalCode:{
//         type:String
//       },
//       redeemed:{
//         type:Boolean
//       },
//       redeemedUsers:[{
//         type: Schema.Types.ObjectId,
//         ref:"User"
//       }],
//       searchHistory:[{
//         category:{
//             type:Schema.Types.ObjectId,
//             ref:"Category"
//         },
//         brand: {
//             type: String
//         },
//         searchOn :{
//             type: Date,
//             default: Date.now
//         }
//       }]


// })

// const User = mongoose.model("User",userSchema)
// module.exports = User


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    otp: { type: String, required: true },  // For OTP storage
    otpExpiration: { type: Date }           // To expire OTP after certain time
});

module.exports = mongoose.model('User', userSchema);
