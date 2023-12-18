const nodemailer=require('nodemailer');
const dotenv=require("dotenv");
dotenv.config();
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");

const sendMail = async (email, subject, payload, template) => {
    console.log(email, subject, payload, template)
    try{
        const transporter = nodemailer.createTransport({
            service:'gmail',
            host: process.env.EMAIL_HOST,
            port: 465,
            auth: {
              user: process.env.MAIL_EMAIL,
              pass: process.env.MAIL_PASSWORD, 
            },
          });

          const source = fs.readFileSync(path.join(__dirname, template), "utf8");
          const compiledTemplate = handlebars.compile(source);
          const options = () => {
            return {
              from: process.env.FROM_EMAIL,
              to: email,
              subject: subject,
              html: compiledTemplate(payload),
            };
          };


                let info=transporter.sendMail(options())
                return info;
            }
            catch(error){
                console.log(error);
                return false;
            }

};

module.exports={sendMail}