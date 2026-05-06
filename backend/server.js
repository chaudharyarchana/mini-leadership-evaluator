require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    // Forced IPv4 for smtp.gmail.com
    host: '74.125.142.108',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    },
    tls: {
        // Essential: must match the hostname expected by Gmail
        servername: 'smtp.gmail.com',
        rejectUnauthorized: false
    }
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Email configuration error:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

app.get('/', (req, res) => {
    res.send('Server is running');
});

// 1. POST Endpoint for Assessment Submission
app.post('/api/submit', async (req, res) => {
    const { name, email, scores, overallTotal } = req.body;

    // Basic validation
    if (!name || !email || !scores) {
        return res.status(400).json({ error: "Missing required assessment data." });
    }

    try {
        const pdfBuffer = await generatePDF({ name, email, scores, overallTotal });

        // 2. Construct the HTML Email
        const dimensionHtml = scores.map(s => `
            <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h3 style="margin: 0; color: #4f46e5;">${s.dimension}</h3>
                <p style="margin: 5px 0;"><strong>Band: ${s.band}</strong> (Score: ${s.score}/15)</p>
                <p style="font-size: 14px; color: #666;">${getFeedback(s.dimension, s.band)}</p>
            </div>
        `).join('');

        // 3. Send the Email with Nodemailer
        const mailOptions = {
            from: `"Leadership Assessment" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Leadership Assessment Report for ${name}`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
                    <h1 style="color: #1e1b4b;">Your Leadership Profile</h1>
                    <p>Hi ${name}, here are your results from the Planet Ganges Mini Assessment.</p>
                    <div style="background: #f5f3ff; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                        <h2 style="margin-top: 0;">Overall Score: ${overallTotal}/45</h2>
                    </div>
                    ${dimensionHtml}
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #999;">Planet Ganges Consulting Technical Assessment</p>
                </div>
            `,
            attachments: [
                {
                    filename: 'Leadership_Report.pdf',
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);

        res.status(200).json({
            message: "Report emailed with PDF!",
            messageId: info.messageId
        });
    } catch (error) {
        console.error("Email Error:", error);
        res.status(503).json({
            error: "Failed to send the email report.",
            details: error.message
        });
    }
});

// Helper function for personalized feedback
function getFeedback(dimension, band) {
    const feedbackMap = {
        "Decision-Making": {
            High: "You show great confidence in leading through ambiguity.",
            Medium: "You make sound choices but could benefit from more stakeholder input.",
            Low: "Focus on developing a structured framework for evaluating risks."
        },
        "Team Communication": {
            High: "You are a master of clarity and alignment within your team.",
            Medium: "Your communication is clear, but ensure you are listening actively as well.",
            Low: "Work on establishing more regular feedback loops with your reports."
        },
        "Strategic Thinking": {
            High: "You possess a strong vision for long-term growth.",
            Medium: "You understand the big picture but sometimes get caught in daily tasks.",
            Low: "Try to block out specific time weekly for long-range planning."
        }
    };
    return feedbackMap[dimension][band];
}

// Helper to generate PDF in memory
async function generatePDF(data) {
    return new Promise((resolve) => {
        const doc = new PDFDocument({ margin: 50 });
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // PDF Content Layout
        doc.fontSize(24).fillColor('#4f46e5').text('Leadership Assessment Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).fillColor('#000').text(`Candidate: ${data.name}`);
        doc.text(`Email: ${data.email}`);
        doc.moveDown();
        doc.fontSize(18).text(`Overall Score: ${data.overallTotal}/45`, { underline: true });
        doc.moveDown();

        data.scores.forEach(s => {
            doc.fontSize(16).fillColor('#4f46e5').text(s.dimension);
            doc.fontSize(12).fillColor('#333').text(`Band: ${s.band} (${s.score}/15)`);
            doc.fontSize(10).fillColor('#666').text(getFeedback(s.dimension, s.band));
            doc.moveDown();
        });

        doc.end();
    });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));