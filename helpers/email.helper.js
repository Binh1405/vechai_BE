const nodeMailer = require("nodemailer");
const Template = require("../models/Template");
const User = require("../models/User");

const emailHelper = {};

emailHelper.createTemplateIfNotExist = async () => {
  try {
    let found = await Template.findOne({ template_key: "verify_email" });
    if (!found) {
      const newTemplate = {
        name: "Verify Email Template",
        template_key: "verify_email",
        description: "This template is used when user register a new email",
        from: "'CoderSchool team'<social_blog@coderschool.vn>",
        subject: `Hi %name% welcome to CoderSchool!`,
        html: `Hi <strong>%name%</strong>
        <br/> <br/>
        Thank you for your registration. 
        <br/> <br/>
        Please confirm your email address by clicking on the link below.
        <br/> <br/>
        %link%
        <br/><br/>
        If you face any difficulty during the sign up, do get in touch with our support team: apply@coderschool.vn
        <br/><br/> Always be learning!
        <br/> CoderSchool team
        `,
        variables: ["name", "link"],
      };
      found = await Template.create(newTemplate);
    }
  } catch (error) {
    console.log("error", error.message);
  }
};
emailHelper.createSingleEmailFromTemplate = async (
  template_key,
  variablesObject, //{name: binh, link: dcnuwib}
  toEmail
) => {
  try {
    const template = await User.findOne({ template_key });
    if (!template)
      throw new Error(
        "Invalid template key, do you want to create new template instead?"
      );
    const data = {
      from: template.name,
      to: toEmail,
      subject: template.subject,
      html: template.html,
    };
    template.variables.forEach((key) => {
      if (!variablesObject[key]) throw new Error("missing value of key");
      let regPattern = new RegExp(`%${key}%`, "g");
      data.subject = data.subject.replace(regPattern, variablesObject[key]);
      data.html = data.html.replace(regPattern, variablesObject[key]);
    });
    return data;
  } catch (error) {
    console.log("Error at eh.cseft 158", error.message);
  }
};

emailHelper.send = async (data) => {
  try {
    if (!data) throw new Error("need emailing content data");
    let transporter = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL,
        pass: process.env.GMAIL_PASSWORD,
      },
    });
    let info = await transporter.sendMail(data);
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.log("error", error);
  }
};

module.exports = emailHelper;
