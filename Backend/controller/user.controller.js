import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import createTokenAndSaveCookie from "../authenticator/jwtAuth.js";
// user.controller.js (signUp section)
export const signUp = async (req, res) => {
  try {
    console.log("Received data:", req.body);
    console.log("Received file:", req.file);

    const { fullName, email, password, confirmPassword } = req.body;
    const avatar = req.file?.filename;

    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      avatar,
    });

    await newUser.save();

    if (newUser) {
      const token = createTokenAndSaveCookie(newUser._id, res); // Get the token
      res.status(201).json({
        message: "User created successfully",
        token: token, // Include token in response
        user: {
          _id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          avatar: newUser.avatar,
        },
      });
    }
  } catch (error) {
    console.error("Signup Error:", {
      message: error.message,
      stack: error.stack,
      body: req.body,
      file: req.file,
    });
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// user.controller.js (signIn section)
export const signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = createTokenAndSaveCookie(user._id, res); // Get the token
    res.status(200).json({
      message: "Sign in successful",
      token: token, // Include token in response
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error in signIn:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const signOut = async(req,res)=>{
try {res.clearCookie("jwt");
res.status(201).json({
    message:"User Logged out successfully"
})
} catch(error) {
    console.log(error);
    res.status(500).json({error:"Internal server error"});
}
}
export const allUsers = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized: No user ID found" });
    }
    const loggedInUser = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUser } }).select("-password");
    res.status(200).json(filteredUsers); // Changed to 200 for GET request
  } catch (error) {
    console.error("Error in getting all users:", error); // Improved logging
    res.status(500).json({ message: "Internal server error", error: error.message }); // Changed to 500 and structured response
  }
};