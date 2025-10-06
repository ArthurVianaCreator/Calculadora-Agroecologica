document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('eco-form');
    const resultDiv = document.getElementById('result');
    const resultSummary = document.querySelector('.result-summary');
    const resultBreakdown = document.querySelector('.result-breakdown');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const calculateBtn = document.getElementById('calculate-btn');
    const progressBar = document.getElementById('progress-bar');
    const navButtons = document.querySelector('.nav-buttons');
    
    let questions;
    let currentQuestionIndex = 0;
    let resultChart = null;

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function setupQuiz() {
        questions = Array.from(form.querySelectorAll('.question'));
        shuffleArray(questions);
        
        form.innerHTML = '';
        questions.forEach(q => {
            const labels = Array.from(q.querySelectorAll('label'));
            shuffleArray(labels);
            labels.forEach(label => q.appendChild(label));
            form.appendChild(q);
        });
        showQuestion(0);
    }

    function showQuestion(index) {
        questions.forEach((q, i) => q.classList.toggle('hidden', i !== index));
        updateProgressBar();
        updateNavButtons();
    }

    function updateProgressBar() {
        progressBar.style.width = `${((currentQuestionIndex + 1) / questions.length) * 100}%`;
    }

    function updateNavButtons() {
        prevBtn.classList.toggle('hidden', currentQuestionIndex === 0);
        nextBtn.classList.toggle('hidden', currentQuestionIndex === questions.length - 1);
        calculateBtn.classList.toggle('hidden', currentQuestionIndex !== questions.length - 1);
    }

    function isCurrentQuestionAnswered() {
        const currentQ = questions[currentQuestionIndex];
        return currentQ.querySelector('input:checked') !== null;
    }

    nextBtn.addEventListener('click', () => {
        if (!isCurrentQuestionAnswered()) { alert('Por favor, selecione uma resposta para continuar.'); return; }
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            showQuestion(currentQuestionIndex);
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            showQuestion(currentQuestionIndex);
        }
    });

    calculateBtn.addEventListener('click', () => {
        if (!isCurrentQuestionAnswered()) { alert('Por favor, responda à última pergunta.'); return; }
        
        const categoryScores = { 'Alimentação': 0, 'Consumo e Recursos': 0, 'Estilo de Vida': 0 };
        const maxCategoryScores = { 'Alimentação': 0, 'Consumo e Recursos': 0, 'Estilo de Vida': 0 };
        let totalScore = 0;

        questions.forEach(q => {
            const category = q.dataset.category;
            const value = parseInt(q.querySelector('input:checked').value);
            categoryScores[category] += value;
            totalScore += value;
            // Todas as questões têm pontuação máxima de 4
            maxCategoryScores[category] += 4;
        });

        displayResult(totalScore, categoryScores, maxCategoryScores);
    });

    function displayResult(score, catScores, maxCatScores) {
        form.classList.add('hidden');
        navButtons.classList.add('hidden');
        progressBar.parentElement.classList.add('hidden');
        resultDiv.classList.remove('hidden');

        let message = '', resultClass = '', icon = '';
        const maxTotalScore = Object.values(maxCatScores).reduce((a, b) => a + b, 0);

        if (score >= 35) {
            icon = '😎'; message = `<strong>Parabéns! Pontuação: ${score}/${maxTotalScore}</strong><p>Seu desempenho é excelente! Você é um exemplo de sustentabilidade.</p>`; resultClass = 'result-great';
        } else if (score >= 25) {
            icon = '😊'; message = `<strong>Muito bem! Pontuação: ${score}/${maxTotalScore}</strong><p>Você está no caminho certo. Continue aprimorando seus hábitos!</p>`; resultClass = 'result-good';
        } else {
            icon = '☹️'; message = `<strong>Pontuação: ${score}/${maxTotalScore}</strong><p>Existem áreas para melhorar. Pequenas mudanças fazem grande diferença!</p>`; resultClass = 'result-improve';
        }
        
        resultSummary.innerHTML = `<div class="result-icon">${icon}</div>${message}<button type="button" id="show-details-btn">Ver Detalhes do Cálculo</button>`;
        resultSummary.className = `result-summary ${resultClass}`;

        renderResultChart(catScores, maxCatScores);

        // Lógica do botão de detalhes
        document.getElementById('show-details-btn').addEventListener('click', (e) => {
            let breakdownHTML = '<h4>Análise por Categoria</h4><ul>';
            for (const category in catScores) {
                breakdownHTML += `<li><strong>${category}:</strong> ${catScores[category]} / ${maxCatScores[category]} pontos</li>`;
            }
            breakdownHTML += '</ul>';
            resultBreakdown.innerHTML = breakdownHTML;
            resultBreakdown.classList.remove('hidden');
            e.target.classList.add('hidden'); // Esconde o botão após clicar
        });
    }

    function renderResultChart(catScores, maxCatScores) {
        const ctx = document.getElementById('resultChart').getContext('2d');
        const labels = Object.keys(catScores);
        const userData = Object.values(catScores);

        if(resultChart) resultChart.destroy();

        resultChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Sua Pontuação',
                    data: userData,
                    backgroundColor: 'rgba(0, 255, 153, 0.2)',
                    borderColor: 'rgba(0, 255, 153, 1)',
                    pointBackgroundColor: 'rgba(0, 255, 153, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(0, 255, 153, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { color: '#f5f5f5', font: { size: 12 } },
                        ticks: { display: false, stepSize: 4 },
                        min: 0,
                        max: 16 // Máximo de pontos por categoria (4 perguntas * 4 pontos)
                    }
                },
                plugins: {
                    legend: { labels: { color: '#f5f5f5' } }
                }
            }
        });
    }

    setupQuiz();
});