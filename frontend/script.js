// 1. Data Structure: 3 Dimensions, 3 Questions Each
const assessmentData = [
    {
        id: "decision",
        title: "Decision-Making",
        questions: [
            "I am comfortable making decisions with limited information.",
            "I weigh the long-term impact of my choices before acting.",
            "I involve relevant team members in the decision process."
        ]
    },
    {
        id: "communication",
        title: "Team Communication",
        questions: [
            "I provide clear and actionable feedback regularly.",
            "I am an active listener during team disputes.",
            "I ensure team objectives are clearly communicated and understood."
        ]
    },
    {
        id: "strategy",
        title: "Strategic Thinking",
        questions: [
            "I prioritize high-impact work over urgent daily tasks.",
            "I can identify emerging trends in our industry easily.",
            "I align my team's focus with the company's 12-month goals."
        ]
    }
];

// 2. Dynamically Build the Form
const wrapper = document.getElementById('questionsWrapper');

assessmentData.forEach(dim => {
    const section = document.createElement('section');
    section.className = "space-y-6";
    section.innerHTML = `<h3 class="text-xl font-bold text-indigo-700 border-l-4 border-indigo-600 pl-4">${dim.title}</h3>`;

    dim.questions.forEach((q, idx) => {
        const qName = `${dim.id}_q${idx}`;
        const qDiv = document.createElement('div');
        qDiv.className = "bg-gray-50 p-4 rounded-xl border border-gray-200";
        qDiv.innerHTML = `
                    <p class="text-gray-800 font-medium mb-4">${idx + 1}. ${q}</p>
                    <div class="flex justify-between items-center max-w-lg mx-auto">
                        <span class="text-xs font-semibold text-gray-400">Disagree</span>
                        <div class="flex gap-2 sm:gap-4">
                            ${[1, 2, 3, 4, 5].map(num => `
                                <label class="cursor-pointer group">
                                    <input type="radio" name="${qName}" value="${num}" required class="hidden peer">
                                    <span class="w-10 h-10 flex items-center justify-center rounded-full border-2 border-gray-300 text-gray-500 font-bold peer-checked:bg-indigo-600 peer-checked:text-white peer-checked:border-indigo-600 transition group-hover:border-indigo-400">
                                        ${num}
                                    </span>
                                </label>
                            `).join('')}
                        </div>
                        <span class="text-xs font-semibold text-gray-400">Agree</span>
                    </div>
                `;
        section.appendChild(qDiv);
    });
    wrapper.appendChild(section);
});

// 3. Logic: Scoring & Submission
const form = document.getElementById('assessmentForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('submitBtn');
    const errorMsg = document.getElementById('errorMessage');

    btn.disabled = true;
    btn.innerText = "Processing Scores...";
    errorMsg.classList.add('hidden');

    const formData = new FormData(form);
    const payload = {
        name: formData.get('name'),
        email: formData.get('email'),
        scores: [],
        overallTotal: 0
    };

    // Calculate Scoring & Bands per dimension
    assessmentData.forEach(dim => {
        let total = 0;
        for (let i = 0; i < 3; i++) {
            total += parseInt(formData.get(`${dim.id}_q${i}`));
        }

        // Define Thresholds: 3-7 Low, 8-11 Medium, 12-15 High
        let band = "Low";
        if (total >= 12) band = "High";
        else if (total >= 8) band = "Medium";

        payload.scores.push({
            dimension: dim.title,
            score: total,
            band: band
        });
        payload.overallTotal += total;
    });

    try {
        // Change URL to your Railway/Render backend once deployed
        const response = await fetch('http://localhost:3000/api/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("Our email service is currently down. Please try again later.");

        // Show Results Screen
        displayResults(payload);
    } catch (err) {
        errorMsg.innerText = err.message;
        errorMsg.classList.remove('hidden');
        btn.disabled = false;
        btn.innerText = "Submit Assessment";
    }
});

function displayResults(data) {
    form.classList.add('hidden');
    document.getElementById('resultsScreen').classList.remove('hidden');
    document.getElementById('userNameDisplay').innerText = data.name;

    const scoreContainer = document.getElementById('dimensionScores');
    data.scores.forEach(s => {
        scoreContainer.innerHTML += `
                    <div class="bg-white p-6 rounded-xl shadow-sm border-t-4 ${s.band === 'High' ? 'border-green-500' : s.band === 'Medium' ? 'border-yellow-500' : 'border-red-500'}">
                        <p class="text-xs uppercase font-black text-gray-400 mb-1">${s.dimension}</p>
                        <h4 class="text-2xl font-bold">${s.band}</h4>
                        <p class="text-gray-500 text-sm mt-2">Score: ${s.score} / 15</p>
                    </div>
                `;
    });
}

// Function to check if the form is valid
function validateForm() {
    const form = document.getElementById('assessmentForm');
    const btn = document.getElementById('submitBtn');

    // 1. Check if built-in HTML5 validation passes (Name, Email format, and required fields)
    const isBasicInfoValid = form.checkValidity();

    // 2. Check if all 9 questions (radio buttons) are answered
    // We expect 9 selected radio buttons (3 dimensions * 3 questions)
    const selectedQuestions = form.querySelectorAll('input[type="radio"]:checked').length;
    const allQuestionsAnswered = selectedQuestions === 9;

    // 3. Update Button State
    if (isBasicInfoValid && allQuestionsAnswered) {
        btn.disabled = false;
        btn.classList.remove('bg-gray-400', 'cursor-not-allowed');
        btn.classList.add('bg-indigo-600', 'hover:bg-indigo-700', 'active:scale-95');
    } else {
        btn.disabled = true;
        btn.classList.add('bg-gray-400', 'cursor-not-allowed');
        btn.classList.remove('bg-indigo-600', 'hover:bg-indigo-700', 'active:scale-95');
    }
}

// Attach the listener to the form
// Use 'input' event to catch typing and radio clicks immediately
document.getElementById('assessmentForm').addEventListener('input', validateForm);