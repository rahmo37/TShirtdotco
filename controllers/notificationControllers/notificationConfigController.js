// This is the controller file for notification configuration

// Importing modules
const webPush = require("web-push");
const Subscription = require("../../models/Subscription");

// VAPID keys for notifications
const publicVapidKey =
  "BK6KC2D0jTxiwOFWO9HjwTgBrIyqSdiyC7E44gGu3VEIG8ubVRsGQEr5QZwoFmtkYHAiQ03TZkmWLLqlUX-brg8";
const privateVapidKey = "6wAE32Ouv2SbNNgB9BZe_cN8aYtM5c1gzHnhaPWDDpw";

// Sign the keys with email
webPush.setVapidDetails(
  process.env.EMAIL,
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
);

const notificationConfigFunctions = {};

notificationConfigFunctions.saveSubscription = async function (req, res, next) {
  // Retrieve the subscription from the body
  const subscription = req.body;

  // Check if the subscription is found
  if (!subscription) {
    const err = new Error("No subscription details found");
    err.status = 400;
    next(err);
  }

  // Retrieve the logged in employee
  const employeeId = req.user.id;

  // Check if the id exists
  if (!employeeId) {
    const err = new Error("No employeeId found");
    err.status = 400;
    next(err);
  }

  // And then add the id inside the subscription object
  subscription.userId = employeeId;

  try {
    // Save subscription to mongo
    const newSubscription = new Subscription(subscription);
    await newSubscription.save();
    res.status(201).json({ message: "Subscription saved" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

notificationConfigFunctions.removeSubscription = async function (
  req,
  res,
  next
) {
  const loggedInEmployeeId = req.user.id;

  // Validate the logged-in employee ID
  if (!loggedInEmployeeId) {
    const err = new Error("No employeeId found");
    err.status = 400;
    return next(err);
  }

  try {
    // Find and delete subscriptions for the logged-in user
    const result = await Subscription.deleteMany({
      userId: loggedInEmployeeId,
    });

    if (result.deletedCount > 0) {
      res.status(200).json({
        message: `${result.deletedCount} subscription(s) removed successfully.`,
      });
    } else {
      const err = new Error("No Subscription Found For This User");
      err.status = 400;
      return next(err);
    }
  } catch (error) {
    console.error("Error removing subscription:", error);
    next(error);
  }
};

notificationConfigFunctions.sendNotification = async (req, res, next) => {
  const { title, message } = req.body;

  try {
    // Fetch all subscriptions from MongoDB
    const subscriptions = await Subscription.find();

    if (!subscriptions.length) {
      return res.status(404).json({ message: "No subscriptions found." });
    }

    // Send notifications to all subscriptions
    subscriptions.forEach((subscription) => {
      webPush
        .sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              auth: subscription.keys.auth,
              p256dh: subscription.keys.p256dh,
            },
          },
          JSON.stringify({ title, message })
        )
        .catch((error) =>
          console.error(
            `Error sending notification to ${subscription.endpoint}:`,
            error
          )
        );
    });

    res.status(200).json({ message: "Notifications sent successfully." });
  } catch (error) {
    console.error(
      "Error fetching subscriptions or sending notifications:",
      error
    );
    next(error); // Pass error to the next middleware for centralized handling
  }
};

module.exports = notificationConfigFunctions;
