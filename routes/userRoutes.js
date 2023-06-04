const router = require("express").Router();
const User = require("../models/User");
const Order = require("../models/Order");

// signup

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await User.create({ name, email, password });
    res.json(user);
  } catch (e) {
    if (e.code === 11000) return res.status(400).send("Email already exists");
    res.status(400).send(e.message);
  }
});

// login

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByCredentials(email, password);
    res.json(user);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// get users;

router.get("/", async (req, res) => {
  try {
    const users = await User.find({ isAdmin: false }).populate("orders");
    res.json(users);
  } catch (e) {
    res.status(400).send(e.message);
  }
});

// get user orders

router.get("/:id/orders", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).populate("orders");
    res.json(user.orders);
  } catch (e) {
    res.status(400).send(e.message);
  }
});
// update user notifcations
router.post("/:id/updateNotifications", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    user.notifications.forEach((notif) => {
      notif.status = "read";
    });
    user.markModified("notifications");
    await user.save();
    res.status(200).send();
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.put("/update-profile", async (req, res) => {
  const user = await User.findById(req.user._id);
  //if user exists
  if (user) {
    //if you want to update username or email
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    //Just update the password
    if (req.body.password) {
      user.password = bcrypt.hashSync(req.body.password);
    }

    const updatedUser = await user.save();
    res.send({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      photoURL: updatedUser.photoURL,
    });
  } else {
    res.status(401).send({ message: "User not Found!" });
  }
});

router.get("/:id/delete-user", async (req, res) => {
  try {
    await User.findOneAndDelete({ _id: req.body.userId });
    res.status(200).json("User Deleted!");
  } catch (error) {
    res.status(400).send(error);
    console.log(error);
  }
});
module.exports = router;
