// 팔 길이 입력 방식 전환
const armLengthRadios = document.querySelectorAll('input[name="armLengthMethod"]');
const armLengthInput = document.getElementById('armLength');
const armLengthHelpText = document.getElementById('armLengthHelpText');

armLengthRadios.forEach(radio => {
    radio.addEventListener('change', function() {
        if (this.value === 'auto') {
            // 자동 계산 모드
            armLengthInput.setAttribute('readonly', 'readonly');
            armLengthInput.style.backgroundColor = '#f5f5f5';
            armLengthInput.style.cursor = 'not-allowed';
            armLengthHelpText.innerHTML = '✅ <strong>자동 계산 모드:</strong> 입력하신 키를 기반으로 평균 팔 길이(키의 51.5%)를 자동으로 계산합니다.';

            // 키가 입력되어 있으면 자동 계산
            const height = parseInt(document.getElementById('height').value);
            if (height && height >= 100 && height <= 250) {
                const calculatedArmLength = Math.round(height * 0.515);
                armLengthInput.value = calculatedArmLength;
            }
        } else {
            // 수동 입력 모드
            armLengthInput.removeAttribute('readonly');
            armLengthInput.style.backgroundColor = 'white';
            armLengthInput.style.cursor = 'text';
            armLengthHelpText.innerHTML = '📏 <strong>측정 방법:</strong> 운동화를 신고 벽에 등을 대고 똑바로 선 후, 팔을 몸 옆에 자연스럽게 늘어뜨린 상태에서 지면부터 손목 주름선까지의 거리를 측정합니다.';
        }
    });
});

// 키 입력 시 팔 길이 자동 계산 (자동 모드일 때만)
document.getElementById('height').addEventListener('input', function(e) {
    const height = parseInt(e.target.value);
    const isAutoMode = document.querySelector('input[name="armLengthMethod"]:checked').value === 'auto';

    if (isAutoMode && height && height >= 100 && height <= 250) {
        // 키의 51.5%를 기본 팔 길이로 계산 (평균 비율)
        const suggestedArmLength = Math.round(height * 0.515);
        armLengthInput.value = suggestedArmLength;
    }
});

// 폼 제출 이벤트 리스너
document.getElementById('golfForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const height = parseInt(document.getElementById('height').value);
    const isAutoMode = document.querySelector('input[name="armLengthMethod"]:checked').value === 'auto';

    // 팔 길이 결정 (자동 모드면 계산, 수동 모드면 입력값 사용)
    let armLength;
    if (isAutoMode) {
        armLength = Math.round(height * 0.515);
    } else {
        armLength = parseInt(document.getElementById('armLength').value);
    }

    // 입력값 가져오기
    const formData = {
        name: document.getElementById('name').value,
        phone: document.getElementById('phone').value,
        height: height,
        weight: parseInt(document.getElementById('weight').value),
        age: parseInt(document.getElementById('age').value),
        gender: document.getElementById('gender').value,
        experience: document.getElementById('experience').value,
        ballFlight: document.getElementById('ballFlight').value,
        armLength: armLength,
        swingSpeed: document.getElementById('swingSpeed').value
    };

    // 추천 계산
    const recommendation = calculateRecommendation(formData);

    // 결과 표시
    displayResult(formData.name, recommendation);
});

// 파크골프채 추천 알고리즘
function calculateRecommendation(data) {
    let clubLength, clubWeight, swingWeight;
    let reasons = [];
    let detailedReasons = {
        intro: '',
        length: '',
        weight: '',
        swingWeight: '',
        conclusion: ''
    };

    // 1. 클럽 길이 계산 (키 기준) - 피팅의 가장 중요한 시작점 (35-40%)
    let lengthReason = '';
    if (data.height < 155) {
        clubLength = 83;
        lengthReason = `회원님의 키(${data.height}cm)를 고려하여 83cm를 선정했습니다. 클럽 길이는 전체 피팅 과정에서 가장 먼저 결정되는 핵심 요소로, 다른 모든 스펙에 영향을 미치는 "Ground Zero" 역할을 합니다`;
    } else if (data.height < 165) {
        clubLength = 84;
        lengthReason = `회원님의 키(${data.height}cm)를 분석한 결과, 표준보다 약간 짧은 84cm가 최적입니다. 클럽 길이는 스윙웨이트와 CPM에 직접적으로 영향을 미치며(0.5인치당 스윙웨이트 3-5포인트 변화), 피팅의 약 35-40%를 차지하는 가장 중요한 기준점입니다`;
    } else if (data.height < 175) {
        clubLength = 85;
        lengthReason = `회원님의 키(${data.height}cm)는 표준 범위에 속하여 85cm의 표준 길이가 이상적입니다. 적절한 클럽 길이는 임팩트 시 일관된 자세를 유지하게 하여 전체 피팅 성공의 35-40%를 결정합니다`;
    } else {
        clubLength = 86;
        lengthReason = `회원님의 키(${data.height}cm)를 고려하여 파크골프 공인 규격 최대 길이인 86cm를 추천합니다. 긴 클럽은 더 넓은 스윙 아크를 만들어 비거리 향상에 유리하며, 이는 전체 클럽 피팅에서 35-40%의 중요도를 차지하는 핵심 요소입니다`;
    }

    // 팔 길이에 따른 클럽 길이 미세 조정 (키 대비 비율로 계산)
    const armLengthRatio = (data.armLength / data.height) * 100;
    let armAdjustment = '';

    if (armLengthRatio < 51) {
        // 팔이 짧은 편 (키의 51% 미만)
        clubLength = Math.max(83, clubLength - 1);
        armAdjustment = `팔 길이가 키 대비 ${armLengthRatio.toFixed(1)}%로 평균(51-53%)보다 짧아 클럽을 1cm 단축했습니다. 이는 어드레스 시 적절한 전경각을 유지하고 임팩트 존에서 정확성을 극대화하기 위함입니다`;
    } else if (armLengthRatio > 53) {
        // 팔이 긴 편 (키의 53% 초과)
        clubLength = Math.min(86, clubLength + 1);
        armAdjustment = `팔 길이가 키 대비 ${armLengthRatio.toFixed(1)}%로 평균(51-53%)보다 길어 클럽을 1cm 연장했습니다. 긴 팔은 자연스럽게 더 낮은 그립 위치를 만들기 때문에, 긴 클럽으로 올바른 어드레스 자세와 스윙 평면을 확보할 수 있습니다`;
    } else {
        // 보통 (키의 51-53%)
        armAdjustment = `팔 길이가 키 대비 ${armLengthRatio.toFixed(1)}%로 이상적인 평균 범위(51-53%)에 속하여 표준 길이가 완벽하게 맞습니다. 이는 가장 효율적인 스윙 메카닉스를 구현할 수 있는 최적의 신체 비율입니다`;
    }

    detailedReasons.length = `【클럽 길이: ${clubLength}cm】\n${lengthReason}. ${armAdjustment}`;
    reasons.push(lengthReason);

    // 2. 클럽 무게 계산 (성별, 나이, 구력 기준) - 스윙 템포와 직결 (30-35%)
    // 한국 파크골프협회 공인 규격: 550g 이하
    let baseWeight = 525; // 기본 무게 (표준 규격)
    let weightFactors = [];

    // 성별에 따른 조정
    if (data.gender === 'female') {
        baseWeight -= 20;
        weightFactors.push('여성의 평균 근력과 스윙 템포를 고려하여 20g 경량화');
    } else {
        weightFactors.push('남성의 평균 근력 특성을 반영한 표준 무게 적용');
    }

    // 나이에 따른 조정
    if (data.age >= 70) {
        baseWeight -= 15;
        weightFactors.push(`${data.age}세 연령대의 근력 저하와 스윙 효율성을 고려하여 15g 추가 경량화`);
    } else if (data.age >= 60) {
        baseWeight -= 10;
        weightFactors.push(`${data.age}세 연령대에 적합하도록 10g 경량화하여 피로도 감소`);
    } else if (data.age >= 50) {
        baseWeight -= 5;
        weightFactors.push(`${data.age}세 연령대의 체력을 고려한 최적 무게 설정`);
    }

    // 구력에 따른 조정
    let experienceText = '';
    if (data.experience === 'beginner') {
        baseWeight -= 10;
        experienceText = '입문 단계(1년 미만)';
        weightFactors.push('초보자의 스윙 안정성 확보를 위해 10g 경량화하여 클럽 컨트롤 능력 향상');
    } else if (data.experience === '1-3') {
        experienceText = '초급(1-3년)';
        weightFactors.push('초급 골퍼의 기술 발전 단계에 적합한 표준 무게 유지');
    } else if (data.experience === '3-5') {
        experienceText = '중급(3-5년)';
        weightFactors.push('중급 골퍼의 스윙 안정성을 바탕으로 한 균형잡힌 무게 설정');
    } else if (data.experience === '5+') {
        baseWeight += 10;
        experienceText = '고급(5년 이상)';
        weightFactors.push('숙련된 골퍼의 정밀한 거리 조절과 방향성 향상을 위해 10g 가중');
    }

    // 한국 파크골프협회 규격 준수 (500g ~ 550g 범위)
    clubWeight = Math.max(500, Math.min(550, baseWeight));

    detailedReasons.weight = `【클럽 무게: ${clubWeight}g】\n총 클럽 무게는 피팅의 30-35%를 차지하는 핵심 요소로, 스윙 템포와 클럽 헤드 속도에 직접적인 영향을 미칩니다. ${weightFactors.join('. ')}. 최종적으로 파크골프 공인 규격(500-550g) 내에서 회원님께 최적화된 ${clubWeight}g을 도출했습니다`;

    // 3. 스윙웨이트 계산 - 클럽 밸런스의 체감 (30-35%)
    let swingWeightReason = '';
    if (data.gender === 'female') {
        if (data.experience === 'beginner' || data.experience === '1-3') {
            swingWeight = 'C8-D0';
            swingWeightReason = `여성 초급자에게 최적화된 C8-D0 범위로, 가벼운 헤드 밸런스가 스윙 중 클럽 컨트롤을 쉽게 만들어 줍니다`;
        } else {
            swingWeight = 'D0-D2';
            swingWeightReason = `여성 중급 이상 골퍼를 위한 D0-D2 범위로, 향상된 스윙 능력에 맞춰 약간 무거운 헤드감으로 방향성과 일관성을 높입니다`;
        }
    } else {
        if (data.experience === 'beginner') {
            swingWeight = 'D0-D2';
            swingWeightReason = `남성 초보자에게 적합한 D0-D2 범위로, 무리 없이 스윙할 수 있는 균형점을 제공합니다`;
        } else if (data.experience === '1-3' || data.experience === '3-5') {
            swingWeight = 'D2-D4';
            swingWeightReason = `중급 골퍼의 발전된 스윙 능력을 고려한 D2-D4 범위로, 헤드의 무게감이 임팩트 시 안정성을 더해줍니다`;
        } else {
            swingWeight = 'D4-D6';
            swingWeightReason = `고급 골퍼를 위한 D4-D6 범위로, 무거운 헤드 밸런스가 정밀한 거리 조절과 강한 임팩트를 가능하게 합니다`;
        }
    }

    detailedReasons.swingWeight = `【스윙웨이트: ${swingWeight}】\n스윙웨이트는 클럽을 휘둘렀을 때 느껴지는 헤드의 무게감을 나타내며, 피팅의 중요 지표입니다. ${swingWeightReason}. 전문 피팅에서는 "스윙웨이트가 맞지 않으면 아무리 좋은 샤프트와 길이도 무용지물"이라는 원칙이 있을 만큼 체감 밸런스가 중요합니다. 추천된 ${swingWeight}는 회원님의 ${experienceText} 수준과 ${data.gender === 'female' ? '여성' : '남성'} 특성에 최적화되었습니다`;

    // 전체 요약 (인트로)
    detailedReasons.intro = `회원님의 신체 조건(키 ${data.height}cm, 팔 길이 ${data.armLength}cm)과 골프 특성(${experienceText})을 종합 분석하여 전문 피팅 프로세스를 진행했습니다. 클럽 피팅에서 길이, 무게, 스윙웨이트는 서로 밀접하게 연관된 중요 요소입니다.`;

    // 종합 결론
    detailedReasons.conclusion = `\n\n【종합 분석】\n위 세 가지 스펙은 서로 긴밀하게 연결되어 있습니다. 클럽 길이 0.5인치 변화 시 스윙웨이트는 3-5포인트 변화하며, 헤드 무게도 전체 밸런스에 영향을 미칩니다. 따라서 길이를 먼저 결정한 후, 무게와 스윙웨이트를 함께 조정하는 순서로 피팅을 진행했습니다. 추천된 스펙은 회원님의 현재 수준에서 최고의 퍼포먼스를 발휘할 수 있도록 과학적으로 설계되었습니다.`;

    return {
        clubLength: clubLength + 'cm',
        clubWeight: clubWeight + 'g',
        swingWeight: swingWeight,
        reasons: reasons,
        detailedReasons: detailedReasons
    };
}

// 결과 표시
function displayResult(name, recommendation) {
    document.getElementById('resultName').textContent = name;
    document.getElementById('clubLength').textContent = recommendation.clubLength;
    document.getElementById('clubWeight').textContent = recommendation.clubWeight;
    document.getElementById('swingWeight').textContent = recommendation.swingWeight;

    // 추천 사유 표시 (상세 버전 사용)
    const detailedReasonText = `
${recommendation.detailedReasons.intro}

${recommendation.detailedReasons.length}

${recommendation.detailedReasons.weight}

${recommendation.detailedReasons.swingWeight}

${recommendation.detailedReasons.conclusion}
    `.trim();

    document.getElementById('recommendationReason').style.whiteSpace = 'pre-line';
    document.getElementById('recommendationReason').textContent = detailedReasonText;

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
