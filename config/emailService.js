const nodemailer = require("nodemailer");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.user,
    pass: process.env.pass
  }
});
const { mailTemplates } = require("../config/emailTemplates");

module.exports.sendMail = async (order, extValues, customStatus, customTo) => {
  let from = `ANGRYBAAZ PVT LTD <${process.env.user}>`, // Angrybaaz email
    to = customTo ? customTo : order[extValues.mailTo].email;
  (mailType = customStatus ? customStatus : order.status.current),
    (options = {});
  if (customTo) {
    options = {
      userName: extValues.userName,
      resetLink: extValues.resetLink || "",
      verifyEmailLink: extValues.verifyEmailLink || ""
    };
  } else {
    options = {
      sellerName: order.seller.orgName,
      quantity: order.status.replacement.quantity
        ? order.status.replacement.quantity
        : order.item.quantity,
      fabric: order.item.fabric,
      type: order.item.type,
      rate: extValues.rate || "",
      delChg: extValues.deliveryChg || "",
      expTime: `${extValues.expTime || ""} day(s)`,
      fabricDetails: extValues.fabricDetails || "",
      custName: order[extValues.mailTo].orgName,
      orderType: order.type,
      orderID: order._id,
      Name: order[extValues.mailTo].orgName,
      role: "seller",
      reason: extValues.reason || "",
      amount: order.info.amount || "",
      paymentId: extValues.paymentId || ""
    };
  }
  let template = mailTemplates(mailType, options),
    subject = template.subject,
    html = template.body,
    mailOptions = { from, to, subject, html };
  try {
    return await transporter.sendMail(mailOptions);
  } catch (err) {
    return err;
  }
};
