document.addEventListener('DOMContentLoaded', () => {
    // Seleção dos elementos do DOM
    const header = document.querySelector('header'); // [NOVO] Seleciona o cabeçalho
    const form = document.getElementById('eco-form');
    const resultDiv = document.getElementById('result');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const calculateBtn = document.getElementById('calculate-btn');
    const progressBar = document.getElementById('progress-bar');
    const navButtons = document.querySelector('.nav-buttons');
    
    let questions = [];
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
        questions.forEach(q => form.appendChild(q));
        showQuestion(0);
    }

    function showQuestion(index) {
        questions.forEach((q, i) => {
            q.classList.toggle('active', i === index);
        });
        form.scrollTop = 0;
        updateProgressBar();
        updateNavButtons();
    }

    function updateProgressBar() {
        const answeredQuestions = currentQuestionIndex;
        const progress = questions.length > 1 ? answeredQuestions / (questions.length - 1) : 1;
        progressBar.style.width = `${progress * 100}%`;
    }

    function updateNavButtons() {
        prevBtn.classList.toggle('hidden', currentQuestionIndex === 0);
        nextBtn.classList.toggle('hidden', currentQuestionIndex === questions.length - 1);
        calculateBtn.classList.toggle('hidden', currentQuestionIndex !== questions.length - 1);
    }

    function isCurrentQuestionAnswered() {
        const currentQ = questions[currentQuestionIndex];
        return currentQ && currentQ.querySelector('input:checked') !== null;
    }

    nextBtn.addEventListener('click', () => {
        if (!isCurrentQuestionAnswered()) { 
            alert('Por favor, selecione uma resposta para continuar.'); 
            return; 
        }
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
        if (!isCurrentQuestionAnswered()) { 
            alert('Por favor, responda à última pergunta.'); 
            return; 
        }
        
        const categoryScores = { 'Alimentação': 0, 'Consumo e Recursos': 0, 'Estilo de Vida': 0 };
        const maxCategoryScores = { 'Alimentação': 0, 'Consumo e Recursos': 0, 'Estilo de Vida': 0 };
        let totalScore = 0;

        questions.forEach(q => {
            const radioChecked = q.querySelector('input:checked');
            const category = q.dataset.category;
            if (radioChecked) {
                const value = parseInt(radioChecked.value);
                categoryScores[category] += value;
                totalScore += value;
            }
            maxCategoryScores[category] += 5;
        });
        displayResult(totalScore, categoryScores, maxCategoryScores);
    });

    function getCategoryFeedback(category, score, maxScore) {
        const percentage = (score / maxScore) * 100;
        const feedback = {
            'Alimentação': {
                high: '🏆 Excelente! Suas escolhas alimentares são conscientes e apoiam um ciclo sustentável.',
                mid: '👍 Bom caminho! Que tal visitar uma feira local para descobrir novos sabores e apoiar pequenos produtores?',
                low: '💡 Pequenas trocas, como preferir alimentos da estação, podem ter um grande impacto na sua saúde e no ambiente.'
            },
            'Consumo e Recursos': {
                high: '🌟 Parabéns! Você demonstra um ótimo domínio sobre o uso consciente dos recursos naturais.',
                mid: '👀 Você está atento! Lembre-se que reduzir o consumo é tão importante quanto reutilizar e reciclar.',
                low: '💧 Comece com pequenas ações, como apagar as luzes. Cada gesto consciente ajuda a preservar nossos recursos.'
            },
            'Estilo de Vida': {
                high: '💚 Seu estilo de vida é um exemplo de harmonia com o meio ambiente. Continue assim!',
                mid: '🚲 Suas práticas são positivas. Considere incorporar mais um hábito sustentável na sua rotina, como a compostagem.',
                low: '🤔 Que tal começar um novo hábito? Separar o lixo reciclável é um ótimo primeiro passo para um grande impacto.'
            }
        };
        if (percentage >= 80) return feedback[category].high;
        if (percentage >= 40) return feedback[category].mid;
        return feedback[category].low;
    }

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
    }

    function displayResult(score, catScores, maxCatScores) {
        // [CORREÇÃO] Esconde os elementos do quiz, incluindo o cabeçalho
        header.style.display = 'none';
        form.style.display = 'none';
        navButtons.style.display = 'none';
        progressBar.parentElement.classList.add('hidden');
        resultDiv.classList.remove('hidden');
        resultDiv.scrollTop = 0; // Garante que a tela de resultado comece no topo

        const resultSummary = document.querySelector('.result-summary');
        const resultBreakdown = document.querySelector('.result-breakdown');
        let resultClass = '', icon = '', title = '', text = '';
        const maxTotalScore = Object.values(maxCatScores).reduce((a, b) => a + b, 0);

        if (score >= 44) { icon = '🌎'; title = 'Guardião da Terra!'; text = 'Seu desempenho é excelente! Você é um verdadeiro exemplo de consciência agroecológica e sustentabilidade. Parabéns!'; resultClass = 'result-great'; } 
        else if (score >= 32) { icon = '🌱'; title = 'Semente do Bem!'; text = 'Você está no caminho certo! Suas ações já causam um impacto positivo. Continue aprimorando seus hábitos!'; resultClass = 'result-good'; } 
        else { icon = '🤔'; title = 'Ponto de Partida!'; text = 'Existem boas oportunidades para melhorar. Pequenas mudanças nos seus hábitos diários podem fazer uma grande diferença!'; resultClass = 'result-improve'; }
        
        resultSummary.innerHTML = `<div class="result-icon">${icon}</div><h3 class="result-title">${title}</h3><div class="result-score"><span>Sua pontuação final</span><strong class="score-value">0</strong> / ${maxTotalScore}</div><p class="result-text">${text}</p>`;
        resultSummary.className = `result-summary ${resultClass}`;
        
        animateValue(resultSummary.querySelector('.score-value'), 0, score, 1500);
        renderResultChart(catScores);

        let breakdownHTML = '<h4>Análise por Categoria</h4><ul>';
        for (const category in catScores) {
            const catScore = catScores[category];
            const maxScore = maxCatScores[category];
            const feedbackText = getCategoryFeedback(category, catScore, maxScore);
            breakdownHTML += `<li><strong>${category}:</strong> ${catScore} / ${maxScore} pontos<span>${feedbackText}</span></li>`;
        }
        breakdownHTML += '</ul>';
        resultBreakdown.innerHTML = breakdownHTML;
        resultBreakdown.classList.remove('hidden');
    }

    function renderResultChart(catScores) {
        const ctx = document.getElementById('resultChart').getContext('2d');
        if(resultChart) resultChart.destroy();
        resultChart = new Chart(ctx, { 
            type: 'radar', 
            data: { 
                labels: Object.keys(catScores).map(l => l === 'Consumo e Recursos' ? ['Consumo', '& Recursos'] : l), 
                datasets: [{ 
                    label: 'Sua Pontuação', 
                    data: Object.values(catScores), 
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
                maintainAspectRatio: false, 
                scales: { 
                    r: { 
                        angleLines: { color: 'rgba(255, 255, 255, 0.2)' }, 
                        grid: { color: 'rgba(255, 255, 255, 0.2)' }, 
                        pointLabels: { color: '#f5f5f5', font: { size: 13 } }, 
                        ticks: { display: false, backdropColor: 'transparent' }, 
                        min: 0, 
                        max: 20 
                    }
                }, 
                plugins: { 
                    legend: { display: false } 
                } 
            } 
        });
    }

    // Inicia o quiz
    setupQuiz();
});