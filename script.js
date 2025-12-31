// 폼 제출 이벤트 리스너
document.getElementById('golfForm').addEventListener('submit', function(e) {
    e.preventDefault();

    // 입력값 가져오기
    const formData = {
        name: document.getElementById('name').value,
        height: parseInt(document.getElementById('height').value),
        weight: parseInt(document.getElementById('weight').value),
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        experience: document.getElementById('experience').value,
        ballFlight: document.getElementById('ballFlight').value,
        armLength: parseInt(document.getElementById('armLength').value),
        swingSpeed: document.getElementById('swingSpeed').value
    };

    // 추천 계산
    const recommendation = calculateRecommendation(formData);

    // 결과 표시
    displayResult(formData.name, recommendation);
});

// 파크골프채 추천 알고리즘
function calculateRecommendation(data) {
    let clubLength, clubWeight, swingWeight, cpm;
    let reasons = [];

    // 1. 클럽 길이 계산 (키 기준)
    if (data.height < 155) {
        clubLength = 83;
        reasons.push('키가 155cm 미만이므로 짧은 클럽을 추천합니다');
    } else if (data.height < 165) {
        clubLength = 84;
        reasons.push('키가 155-165cm 사이이므로 표준보다 약간 짧은 클럽을 추천합니다');
    } else if (data.height < 175) {
        clubLength = 85;
        reasons.push('키가 165-175cm 사이이므로 표준 길이의 클럽을 추천합니다');
    } else {
        clubLength = 86;
        reasons.push('키가 175cm 이상이므로 공인 규격 최대 길이인 86cm를 추천합니다');
    }

    // 팔 길이에 따른 클럽 길이 미세 조정 (키 대비 비율로 계산)
    const armLengthRatio = (data.armLength / data.height) * 100;

    if (armLengthRatio < 51) {
        // 팔이 짧은 편 (키의 51% 미만)
        clubLength = Math.max(83, clubLength - 1);
        reasons.push(`팔이 짧은 편(키 대비 ${armLengthRatio.toFixed(1)}%)이므로 클럽 길이를 약간 줄였습니다`);
    } else if (armLengthRatio > 53) {
        // 팔이 긴 편 (키의 53% 초과)
        clubLength = Math.min(86, clubLength + 1);
        reasons.push(`팔이 긴 편(키 대비 ${armLengthRatio.toFixed(1)}%)이므로 클럽 길이를 약간 늘렸습니다`);
    } else {
        // 보통 (키의 51-53%)
        reasons.push(`팔 길이가 평균(키 대비 ${armLengthRatio.toFixed(1)}%)이므로 표준 길이가 적합합니다`);
    }

    // 2. 클럽 무게 계산 (성별, 나이, 구력 기준)
    // 한국 파크골프협회 공인 규격: 550g 이하
    let baseWeight = 525; // 기본 무게 (표준 규격)

    // 성별에 따른 조정
    if (data.gender === 'female') {
        baseWeight -= 20;
        reasons.push('여성이시므로 가벼운 무게를 추천합니다');
    } else {
        reasons.push('남성이시므로 적당한 무게를 추천합니다');
    }

    // 나이에 따른 조정
    if (data.age >= 70) {
        baseWeight -= 15;
        reasons.push('70대 이상이시므로 더 가벼운 클럽을 추천합니다');
    } else if (data.age >= 60) {
        baseWeight -= 10;
    }

    // 구력에 따른 조정
    if (data.experience === 'beginner') {
        baseWeight -= 10;
        reasons.push('입문 단계이므로 가벼운 클럽으로 시작하시는 것을 추천합니다');
    } else if (data.experience === '5+') {
        baseWeight += 10;
        reasons.push('고급 골퍼이시므로 약간 무거운 클럽으로 정확도를 높이실 수 있습니다');
    }

    // 한국 파크골프협회 규격 준수 (500g ~ 550g 범위)
    clubWeight = Math.max(500, Math.min(550, baseWeight));

    // 3. 스윙웨이트 계산
    if (data.gender === 'female') {
        if (data.experience === 'beginner' || data.experience === '1-3') {
            swingWeight = 'C8-D0';
            reasons.push('여성 초급자에게 적합한 스윙웨이트입니다');
        } else {
            swingWeight = 'D0-D2';
            reasons.push('여성 중급 이상 골퍼에게 적합한 스윙웨이트입니다');
        }
    } else {
        if (data.experience === 'beginner') {
            swingWeight = 'D0-D2';
        } else if (data.experience === '1-3' || data.experience === '3-5') {
            swingWeight = 'D2-D4';
            reasons.push('중급 골퍼에게 적합한 균형잡힌 스윙웨이트입니다');
        } else {
            swingWeight = 'D4-D6';
            reasons.push('고급 골퍼에게 적합한 헤드가 무거운 스윙웨이트입니다');
        }
    }

    // 4. CPM (진동수) 계산
    let baseCPM = 240;

    // 성별에 따른 조정
    if (data.gender === 'female') {
        baseCPM = 220;
    }

    // 나이에 따른 조정
    if (data.age >= 70) {
        baseCPM -= 15;
    } else if (data.age >= 60) {
        baseCPM -= 10;
    } else if (data.age >= 50) {
        baseCPM -= 5;
    }

    // 구력에 따른 조정
    if (data.experience === 'beginner') {
        baseCPM -= 10;
        reasons.push('입문자에게 적합한 부드러운 샤프트를 추천합니다');
    } else if (data.experience === '5+') {
        baseCPM += 10;
        reasons.push('고급 골퍼에게 적합한 단단한 샤프트를 추천합니다');
    }

    // 구질에 따른 미세 조정
    if (data.ballFlight === 'slice') {
        baseCPM -= 5;
        reasons.push('슬라이스 개선을 위해 약간 부드러운 샤프트를 추천합니다');
    } else if (data.ballFlight === 'hook') {
        baseCPM += 5;
        reasons.push('훅 개선을 위해 약간 단단한 샤프트를 추천합니다');
    }

    // 스윙 스피드에 따른 CPM 조정 (가장 중요한 요소)
    if (data.swingSpeed === 'very-slow') {
        baseCPM -= 15;
        reasons.push('스윙이 매우 느리므로 부드러운 샤프트로 비거리를 보완합니다');
    } else if (data.swingSpeed === 'slow') {
        baseCPM -= 7;
        reasons.push('스윙이 느린 편이므로 부드러운 샤프트를 추천합니다');
    } else if (data.swingSpeed === 'fast') {
        baseCPM += 7;
        reasons.push('스윙이 빠른 편이므로 단단한 샤프트로 정확도를 높입니다');
    } else if (data.swingSpeed === 'very-fast') {
        baseCPM += 15;
        reasons.push('스윙이 매우 빠르므로 단단한 샤프트로 컨트롤을 향상시킵니다');
    }

    cpm = baseCPM;

    return {
        clubLength: clubLength + 'cm',
        clubWeight: clubWeight + 'g',
        swingWeight: swingWeight,
        cpm: cpm + ' CPM',
        reasons: reasons
    };
}

// 결과 표시
function displayResult(name, recommendation) {
    document.getElementById('resultName').textContent = name;
    document.getElementById('clubLength').textContent = recommendation.clubLength;
    document.getElementById('clubWeight').textContent = recommendation.clubWeight;
    document.getElementById('swingWeight').textContent = recommendation.swingWeight;
    document.getElementById('cpm').textContent = recommendation.cpm;

    // 추천 사유 표시
    const reasonText = recommendation.reasons.join('. ') + '.';
    document.getElementById('recommendationReason').textContent = reasonText;

    // 폼 숨기고 결과 표시
    document.getElementById('formContainer').style.display = 'none';
    document.getElementById('resultContainer').style.display = 'block';

    // 상단으로 스크롤
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 다시 측정하기
function resetForm() {
    document.getElementById('golfForm').reset();
    document.getElementById('formContainer').style.display = 'block';
    document.getElementById('resultContainer').style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
