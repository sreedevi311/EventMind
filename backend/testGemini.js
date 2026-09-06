import "dotenv/config";
import nodemailer from "nodemailer";

async function test() {
  try {
    console.log("EMAIL:", process.env.EMAIL_USER);
    console.log("PASS LENGTH:", process.env.EMAIL_PASS.length);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.verify();
    console.log("✅ SMTP verified");

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "Test Mail",
      text: "Hello from EventMind",
    });

    console.log("✅ Mail sent:", info.messageId);
  } catch (err) {
    console.error(err);
  }
}

test();