document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('eco-form');
    const resultDiv = document.getElementById('result');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const calculateBtn = document.getElementById('calculate-btn');
    const progressBar = document.getElementById('progress-bar');
    const navButtons = document.querySelector('.nav-buttons');
    
    let questions;
    let currentQuestionIndex = 0;

    // --- Função para embaralhar um array (Fisher-Yates shuffle) ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    // --- Prepara e embaralha o quiz ---
    function setupQuiz() {
        questions = Array.from(form.querySelectorAll('.question'));

        // 1. Embaralha as alternativas dentro de cada questão
        questions.forEach(question => {
            const labels = Array.from(question.querySelectorAll('label'));
            shuffleArray(labels);
            labels.forEach(label => question.appendChild(label));
        });

        // 2. Embaralha a ordem das próprias questões
        shuffleArray(questions);
        
        // 3. Limpa o formulário e anexa apenas a primeira questão
        form.innerHTML = '';
        questions.forEach(q => form.appendChild(q)); // Mantém todas no DOM para cálculo
        
        showQuestion(0);
    }

    // --- Mostra a questão atual e esconde as outras ---
    function showQuestion(index) {
        questions.forEach((question, i) => {
            question.classList.toggle('hidden', i !== index);
        });
        updateProgressBar();
        updateNavButtons();
    }

    // --- Atualiza a barra de progresso ---
    function updateProgressBar() {
        const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // --- Atualiza a visibilidade dos botões ---
    function updateNavButtons() {
        prevBtn.classList.toggle('hidden', currentQuestionIndex === 0);
        nextBtn.classList.toggle('hidden', currentQuestionIndex === questions.length - 1);
        calculateBtn.classList.toggle('hidden', currentQuestionIndex !== questions.length - 1);
    }

    // --- Valida se a questão atual foi respondida ---
    function isCurrentQuestionAnswered() {
        const currentQuestion = questions[currentQuestionIndex];
        const inputName = currentQuestion.dataset.questionName;
        const selectedOption = form.querySelector(`input[name="${inputName}"]:checked`);
        return selectedOption !== null;
    }

    // --- Event Listeners dos botões ---
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
            alert('Por favor, responda à última pergunta para ver seu resultado.');
            return;
        }

        let totalScore = 0;
        questions.forEach(question => {
            const inputName = question.dataset.questionName;
            const selectedOption = form.querySelector(`input[name="${inputName}"]:checked`);
            if (selectedOption) {
                totalScore += parseInt(selectedOption.value);
            }
        });

        displayResult(totalScore);
    });

    // --- Mostra o resultado final ---
    function displayResult(score) {
        form.classList.add('hidden');
        navButtons.classList.add('hidden');
        progressBar.parentElement.classList.add('hidden');

        let message = '';
        let resultClass = '';

        if (score >= 35) {
            message = `<strong>Parabéns! Sua pontuação é ${score} de 40.</strong><br>Suas escolhas são extremamente sustentáveis. Continue sendo um exemplo!`;
            resultClass = 'result-great';
        } else if (score >= 25) {
            message = `<strong>Muito bem! Sua pontuação é ${score} de 40.</strong><br>Você está no caminho certo para um estilo de vida mais sustentável. Continue assim!`;
            resultClass = 'result-good';
        } else {
            message = `<strong>Sua pontuação é ${score} de 40.</strong><br>Existem algumas áreas onde você pode melhorar. Pequenas mudanças podem fazer uma grande diferença para o planeta!`;
            resultClass = 'result-improve';
        }

        resultDiv.innerHTML = message;
        resultDiv.className = '';
        resultDiv.classList.add(resultClass);
    }

    // --- Inicia o quiz ---
    setupQuiz();
});