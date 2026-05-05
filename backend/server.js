require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend'); // Using Resend as it's modern and easy

const app = express();
const resend = new Resend(process.env.RESEND_API_KEY); // Securely using environment variable

app.use(cors());
app.use(express.json());

// 1. POST Endpoint for Assessment Submission
app.post('/api/submit', async (req, res) => {
    const { name, email, scores, overallTotal } = req.body;

    // Basic validation
    if (!name || !email || !scores) {
        return res.status(400).json({ error: "Missing required assessment data." });
    }

    try {
        // 2. Construct the HTML Email
        const dimensionHtml = scores.map(s => `
            <div style="margin-bottom: 15px; padding: 10px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h3 style="margin: 0; color: #4f46e5;">${s.dimension}</h3>
                <p style="margin: 5px 0;"><strong>Band: ${s.band}</strong> (Score: ${s.score}/15)</p>
                <p style="font-size: 14px; color: #666;">${getFeedback(s.dimension, s.band)}</p>
            </div>
        `).join('');

        // 3. Send the Email
        const data = await resend.emails.send({
            from: 'Assessment <onboarding@resend.dev>', // Update with your domain later
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
            `
        });

        res.status(200).json({ message: "Report sent successfully!", id: data.id });
    } catch (error) {
        console.error("Email Error:", error);
        res.status(503).json({ error: "Failed to send the email report." }); // Handle email failure
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));