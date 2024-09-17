import {asyncHandler} from '../utils/asycnHandler.js';
import {ApiError} from '../utils/ApiError.js'
import { User} from '../models/user.model.js'
import {uploadOnCloudinary} from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken'

const generateAccessAndRefreshToken = async (userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken= refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and Access tokens")
    }
}

const registerUser = asyncHandler( async ( req, res) => {
    // get user details from frontend
    // validation - empty not
    //check if user already exist - email, username
    // check for images
    // check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refreshToken field from response
    // check for user creation 
    // return res

    const {fullName, username, email, password} = req.body
    console.log(email, password, fullName, username);

   
    if(
        [fullName, username, email, password].some( (field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findById({
        $or:[{ email}, { username}]
    })

    if (existedUser){
        throw new ApiError(409, "User with email  or username already exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log(req.files);

    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required");

    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase(),
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while regitering the user");
    }

    return res.status(200).json(
       ApiResponse(200,createdUser," User registered successfully")
    )


})

const loginUser = asyncHandler( async (req, res) => {
    //req body -> data
    // username , email 
    //find the user
    // check password
    //access and refreshtoken
    //send cookie
    //send res

    const {email, username, password} = req.body
    if(!(username || email)){
        throw new ApiError(400,"username and password is required")

    }
   const user = await User.findOne(
    {
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(400, "User does not exist")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    
    if(!isPasswordValid){
        throw new ApiError(400,"Invalid user credentials")
    }

    const {accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.
    status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
        new ApiResponse(
            200,
            {
            user: loggedInUser, accessToken, refreshToken
            },
            "User logged in Successfully"
        )

    )

})

const logOutUser = asyncHandler( async (req, res) => {
    const user = User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined
        }
       
    },
    {
        new:true
    }
    )
    const options = {
        httpOnly:true,
        secure:true
    }

    return res
    .status(200)
    .clearcookie("accessToken")
    .clearcookie("refreshToken")
    .json(
        new ApiResponse(200, {}, "User loged out successfully")
    )
})

const refreshAccessToken = asyncHandler( async (req, res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized Request")
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401, "Invalide refresh Token")
    
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401,"Refresh token is expired or used")
        }
    
        const options={
            httpOnly:true,
            secure:true
        }
       const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
       return res
       .status(200)
       .cookie("accessToken",accessToken,options)
       .cookie("refreshToken", newRefreshToken,options)
       .json(
        new ApiResponse(200,
        {accessToken, refreshToken:newRefreshToken},
        "Access Token Refresh")
       )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalide refresh token")
    }
})

const changeCurrentPassword = asyncHandler( async () =>{
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPasswordCorrect){
        throw new ApiError(401, "Invalid Old Password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave:false})
    return res
    .status(200)
    .json(
        new ApiResponse(
        200,
        {},
        "Password Change Successfull")
    )
})

const getCurrentUser = asyncHandler( async(req, res) => {
    return res
    .status(200)
    .json(200, req.user, "current user fetched successfully")
})

const updateAccountDetails = asyncHandler( async () => {
    const {fullName, email} = req.body

    if(! (fullName || email)){
        throw new ApiError(400,"All field are required")
    }

    User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName,
                email:email,

            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200,user, "Account details updated successfully"))
})

const updateAvatar = asyncHandler( async(req, res)=>{
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar){
        throw new ApiError(400,'Error on uploading Avatar')
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar : avatar.url
            }
        },
        {new : true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,
        user,
        "Avatar Image is updated successfully ")
    )
})

const updateCoverImage = asyncHandler( async(req, res)=>{
    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400,"Cover Image  file is missing")

    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImageLocalPath){
        throw new ApiError(400,"Error on uploading Cover Image")

    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Cover Image is updaed successfully")
    )
})



export  {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage
}