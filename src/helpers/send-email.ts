import nodemailer from 'nodemailer';

interface Options {
  email: string;
  subject: string;
  text: string;
}

export const sendEmail = async (options: Options) => {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_USER_EMAIL as string),
    auth: {
      user: process.env.SMTP_USER_EMAIL, // generated ethereal user
      pass: process.env.SMTP_PASSWORD, // generated ethereal password
    },
  });

  const message = {
    from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`, // sender address
    to: options.email,
    subject: options.subject, // Subject line
    text: options.text, // plain text body
  };

  // send mail with defined transport object
  const info = await transporter.sendMail(message);

  console.log('info: ', info);
};
