module.exports.mailTemplates = (mailType, options) => {
  let template = {
    requested: {
      subject: "Request: Enquiry for bulk order of T-Shirts",
      body: `Hi <b>${options.sellerName}</b>,<br>
            <p>You have got a new enquiry request for cost of printing <b>${
              options.quantity
            } ${options.fabric} ${
        options.type
      }</b> T-shirts and there expected delivery. Please check your dashboard by clicking below URL to respond.</p><br>
            <a href='www.angrybaaz.com/dashboard'>View dashboard</a><br>
            Note: Do not reply to this email.<br><br>
            Thanks,<br>
            Team Angrybaaz`
    }, //to seller by customer
    responded: {
      subject: `Response from ${options.sellerName} for your request`,
      body: `Hi <b>${options.custName}</b>,<br>
                <p>You have got a response for your request of printing <b>${
                  options.quantity
                } ${options.fabric} ${options.type}</b>T-shirts from <b>${
        options.sellerName
      }</b>. Please check your dashboard by clicking below URL to create order or cancel enquiry.</p>
            Response:<br>
            <ul>
                <li>Per Tshirt rate: ₹ ${options.rate}</li>
                <li>Delivery Charges: ₹ ${options.delChg}</li>
                <li>Expected Time: ${options.expTime}</li>
            </ul><br>
                <a href='www.angrybaaz.com/dashboard'>View dashboard</a><br>
                Note: Do not reply to this email.
   <br><br>
   Thanks,<br>
   Team Angrybaaz`
    }, //to customer by seller
    cancelled: {
      subject: `Cancellation of ${options.orderType} with ID: ${
        options.orderID
      }`,
      body: `Hi <b>${options.Name}</b>,<br>
            <p>We are sorry to inform you that the ${
              options.orderType
            } of printing <b>${options.quantity} ${options.fabric} ${
        options.type
      }</b> T-shirts has been cancelled.<br>Reason: ${
        options.reason
      }<br> Please check your dashboard for more details.</p><br>
            <a href='www.angrybaaz.com/dashboard'>View dashboard</a><br>
            Note: Do not reply to this email.<br><br>
            Thanks,<br>
            Team Angrybaaz`
    }, //to seller by customer
    processing: {
      subject: `Your order with ${options.sellerName} is processing`,
      body: `Hi <b>${options.custName}</b>!,<br>
            <p>Your order for printing <b>${options.quantity} ${
        options.fabric
      } ${
        options.type
      }</b> T-shirts has been confirmed by the seller and is processing. Please check 'My Orders' section in your dashboard for more details.</p><br>
            <a href='www.angrybaaz.com/dashboard'>View dashboard</a><br>
            Note: Do not reply to this email.<br><br>
            Thanks,<br>
            Team Angrybaaz`
    }, //to customer by seller
    shipped: {
      subject: `Your order with ${options.sellerName} has been shipped`,
      body: `Hi <b>${options.custName}</b>!,<br>
            <p>Your order for printing <b>${options.quantity} ${
        options.fabric
      } ${
        options.type
      }</b> T-shirts has been shipped by the seller. Please check 'My Orders' section in your dashboard for more details.</p><br>
            <a href='www.angrybaaz.com/dashboard'>View dashboard</a><br>
            Note: Do not reply to this email.<br><br>
            Thanks,<br>
            Team Angrybaaz`
    }, //to customer by seller
    delivered: {
      subject: `Your order with ${options.sellerName} was delivered`,
      body: `Congratulations <b>${options.custName}</b>!,<br>
            <p>Your order for printing <b>${options.quantity} ${
        options.fabric
      } ${
        options.type
      } </b>T-shirts was delivered successfully. Please check 'My Orders' section in your dashboard for more details.</p><br>
            <a href='www.angrybaaz.com/dashboard'>View dashboard</a><br>
            Leave a feedback review so that we can improve our services.
            Note: Do not reply to this email.<br><br>
            Thanks,<br>
            Team Angrybaaz`
    }, //to customer by seller
    replacement: {
      subject: `Replacement of order with ID: ${options.orderID}`,
      body: `Hi <b>${options.custName}</b>,<br>
            <p>We apologize for the inconvenience caused. We have received your replacement request for <b>${
              options.quantity
            }</b> units. Your request has been forwarded to the seller. Please be patient and check 'My Orders' section in your dashboard for more details.</p><br>
            <a href='www.angrybaaz.com/dashboard'>View dashboard</a><br>
            Note: Do not reply to this email.<br><br>
            Thanks,<br>
            Team Angrybaaz`
    }, // to customer by seller
    "replacement-seller": {
      subject: `Replacement of order with ID: ${options.orderID}`,
      body: `Hi <b>${options.sellerName}</b>,<br>
            <p>We have received a replacement request for <b>${
              options.quantity
            }</b> units of defective T-Shirts by our customer. Please accept/decline as required through 'My Orders' section in your dashboard.</p><br>
            <a href='www.angrybaaz.com/dashboard'>View dashboard</a><br>
            Note: Do not reply to this email.<br><br>
            Thanks,<br>
            Team Angrybaaz`
    }, //to seller by customer
    "replacement-accepted": {
      subject: `Replacement of order with ID: ${options.orderID}`,
      body: `Hi <b>${options.custName}</b>,<br>
            <p>We apologize for the inconvenience caused. Your replacement request has been accepted by the seller and a new order has been created for those defective products. Please be patient and check 'My Orders' section in your dashboard for more details.</p><br>
            <a href='www.angrybaaz.com/dashboard'>View dashboard</a><br>
            Note: Do not reply to this email.<br><br>
            Thanks,<br>
            Team Angrybaaz`
    }, //to customer by seller
    "replacement-declined-seller": {
      subject: `Replacement of order with ID: ${options.orderID}`,
      body: `Hi <b>${options.custName}</b>,<br>
            <p>We apologize for the inconvenience caused. Your replacement request has been declined by the seller and they have provided following reason: <b>${
              options.reason
            }</b> Please be patient while we contact the seller regarding this.</p><br>
            <a href='www.angrybaaz.com/dashboard'>View dashboard</a><br>
            Note: Do not reply to this email.<br><br>
            Thanks,<br>
            Team Angrybaaz`
    }, //to customer by seller
    "replacement-declined-admin": {
      subject: `Replacement of order with ID: ${options.orderID}`,
      body: `Hi <b>${options.custName}</b>,<br>
            <p>We apologize for the inconvenience caused. Your replacement request has been declined by the admin and hence could not be processed further.</p><br>
            <a href='www.angrybaaz.com/dashboard'>View dashboard</a><br>
            Note: Do not reply to this email.<br><br>
            Thanks,<br>
            Team Angrybaaz`
    }, //to customer by seller
    "payment-success-customer": {
      subject: `Order Confirmation for order with ID: ${options.orderID}`,
      body: `Congratulations <b>${options.custName}</b>!,<br>
      <p>Thank you shopping at Angrybaaz.<br> We have confirmed your order for printing <b>${
        options.quantity
      } ${options.fabric} ${options.type}</b> T-shirts.<br>
            <p>Your order Payment of ₹ ${
              options.amount
            } is successfull for this order. Transaction ID: ${
        options.paymentId
      }.</p><br>
            <a href='google.com'>View dashboard</a><br>
            Note: Do not reply to this email.<br><br>
            Thanks,<br>
            Team Angrybaaz`
    }, //to customer by seller
    "payment-success-seller": {
      subject: `Confirmation of order with ID: ${options.orderID}`,
      body: `Congratulations <b>${options.sellerName}</b>!,<br>
              <p>You have received a new order. We have confirmed this order for printing <b>${
                options.quantity
              } ${options.fabric} ${
        options.type
      }</b> T-shirts with our customer.<br>You are requested to process this order ASAP. Please check 'Pending Orders' section in your dashboard for more details.</p><br>
              <a href='google.com'>View dashboard</a><br>
              Note: Do not reply to this email.<br><br>
              Thanks,<br>
              Team Angrybaaz`
    }, //to seller by customer
    "password-changed": {
      subject: `Password changed`,
      body: `Hi <b>${options.userName}</b>,<br>
            <p>As requested, Your password for Angrybaaz has been changed successfully. You can now login with your new password.</p><br>
            <a href='www.angrybaaz.com/dashboard'>View dashboard</a><br>
            Note: Do not reply to this email.<br><br>
            Thanks,<br>
            Team Angrybaaz`
    },
    "reset-link": {
      subject: `Reset Password Link`,
      body: `Hi <b>${options.userName}</b>,<br>
            <p>you are receiving this email because you (or someone else) has requested a password reset for your account.<br>
            To reset your password, Please click on the link below: <br>
            <a href = '${
              options.resetLink
            }'><font color = "red">Reset Password</font></a><br>
            This link is valid only for 1 hour. If you have not requested this, please ignore it, your password will remain unchanged.</p><br>
            <a href='www.angrybaaz.com/dashboard'>View dashboard</a><br>
            Note: Do not reply to this email.<br><br>
            Thanks,<br>
            Team Angrybaaz`
    },
    "reset-success": {
      subject: `Reset Password Successfull`,
      body: `Hi <b>${options.userName}</b>,<br>
            <p>As requested, Your password for Angrybaaz has been resetted successfully. You can now login with your new password.</p><br>
            <a href='www.angrybaaz.com/dashboard'>View dashboard</a><br>
            Note: Do not reply to this email.<br><br>
            Thanks,<br>
            Team Angrybaaz`
    },
    "verify-email-link": {
      subject: `Verify your email address with Angrybaaz`,
      body: `Hi <b>${options.userName}</b>,<br>
                  <p>you are receiving this email because you have successfully registered with us!<br>
                  To verify your email, Please click on the link below: <br>
                  <a href = '${
                    options.verifyEmailLink
                  }'><font color = "red">Verify Email</font></a><br>
                  This link is valid only for 1 hour.</p><br>
                  <a href='www.angrybaaz.com/dashboard'>View dashboard</a><br>
                  Note: Do not reply to this email.<br><br>
                  Thanks,<br>
                  Team Angrybaaz`
    }
  };
  return template[mailType];
};

// subject and body should be optimised: short, precise, and formal
