let questionNum = 0
const cations = [
    ["Li", "lithium", 1, "common"],
    ["Na", "sodium", 1, "common"],
    ["K", "potassium", 1, "common"],

    ["Be", "beryllium", 2, "common"],
    ["Mg", "magnesium", 2, "common"],
]
const anions = [
    ["F", "fluorine", "fluoride", 1, "common"],
    ["Cl", "chlorine", "chloride", 1, "common"],
    ["Br", "bromine", "bromide", 1, "common"],
    ["I", "iodine", "iodide", 1, "common"],

    ["O", "oxygen", "oxide", 2, "common"],
    ["S", "sulfur", "sulfide", 2, "common" ]

]

class Cation {
    constructor(symbol, name, charge, additional_info) {
        this.symbol = symbol
        this.name = name
        this.charge = charge
    }
}

class Anion {
    constructor(symbol, name, ionName, charge, additional_info) {
        this.symbol = symbol
        this.name = name
        this.ionName = ionName
        this.charge = charge
    }
}

function levenshteinDist(str1, str2) {
    //generated by ChatGPT
    str1 = str1.toLowerCase();
    str2 = str2.toLowerCase();

    const matrix = Array.from({ length: str1.length + 1 }, () => Array(str2.length + 1).fill(0));

    for (let i = 0; i <= str1.length; i++) {
        matrix[i][0] = i;
    }
    for (let j = 0; j <= str2.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= str1.length; i++) {
        for (let j = 1; j <= str2.length; j++) {
            const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,       
                matrix[i][j - 1] + 1,       
                matrix[i - 1][j - 1] + cost 
            );
        }
    }

    return matrix[str1.length][str2.length];
}

function hammingDist(str1, str2) {
    let score = 0;
    for (let i = 0; i < str1.length; i++) {
        if (str1[i] !== str2[i]) {
            score++;
        }
    }
    return score;
}

function spellCheck(str1, str2) {
    str1 = str1.toLowerCase().trim();
    str2 = str2.toLowerCase().trim();


    if (str1 === str2) {
        return true;
    }

    const lastThreeChars1 = str1.slice(-3);
    const lastThreeChars2 = str2.slice(-3);

    // Check if the last three characters are 'ide', 'ate', or 'ite'
    const isLastThreeSame = lastThreeChars1 === lastThreeChars2;
    if (!isLastThreeSame && ['ide', 'ate', 'ite'].includes(lastThreeChars1)) {
        return false;
    }

    const pieces1 = str1.split(' ');
    const pieces2 = str2.split(' ');

    if (pieces1.length !== pieces2.length) {
        return false;
    }

    if (pieces1.length > 1) {
        for (let i = 0; i < pieces1.length; i++) {
            if (!spellCheck(pieces1[i], pieces2[i])) {
                return false;
            }
        }
        return true;
    }

    if (str1.length === str2.length) {
        if (hammingDist(str1, str2) <= 2) {
            return true;
        }
    }

    if (levenshteinDist(str1, str2) <= 1) {
        return true;
    }

    return false;
}

function generateIons() {
    let cationArr = []
    let anionArr = []
    cations.forEach((cation) => {
        cationArr.push(new Cation(...cation))        
    })
    anions.forEach((anion) => {
        anionArr.push(new Anion(...anion))        
    })

    return {cations:cationArr,anions:anionArr}
}

function reduce(num1, num2) {
    for (let factor = Math.min(num1,num2); factor>1;factor--) {
        if (num1 % factor == 0 && num2 % factor == 0) {
            num1 /= factor
            num2 /= factor
        }
    }
    return [num1, num2]
}

function styleSub(val) {
    let sub = ""
    if (val != 1) {
        sub = `<sub>${val}</sub>`
    }
    return sub
}

function generateQuestion(ions) {
    const cations = ions.cations
    const anions = ions.anions
    const element1 = cations[Math.floor(Math.random()*cations.length)]
    const element2 = anions[Math.floor(Math.random()*anions.length)]
    let [val1, val2] = reduce(element2.charge,element1.charge)   

    const questionStem = `${element1.symbol}${styleSub(val1)}${element2.symbol}${styleSub(val2)}`

    const questionAnswer = `${element1.name} ${element2.ionName}`

    return [questionStem, questionAnswer]
}

function newQuestion(ions) {
   const [questionStem, questionAnswer] = generateQuestion(ions)
   questionNum ++
    const newForm = document.createElement("form")
    newForm.setAttribute("id", `questionSection${questionNum}`)
    newForm.setAttribute("onsubmit", "return false")
    newForm.setAttribute("autocomplete", "false")
    const stem = document.createElement("label")
    stem.setAttribute("for", `question${questionNum}`)
    stem.innerHTML = questionStem
    const answer = document.createElement("input");
    answer.setAttribute("id", `question${questionNum}`)
    answer.setAttribute("placeholder", "sodium chloride")
    answer.setAttribute("autocomplete", "off"); 

    const answer_button = document.createElement("input");
    answer_button.setAttribute("type", "submit");
    answer_button.setAttribute("value", "Submit");
    answer_button.setAttribute("counter", 0)
    const status = document.createElement("p")
    status.innerHTML = ""


    answer_button.addEventListener("click", () => {
        console.log(answer_button.getAttribute("counter"))
        if (spellCheck(questionAnswer,answer.value)) {
            answer.disabled = true;
            status.innerHTML = `Yes, ${questionAnswer} is correct!`
            answer_button.remove()
            newQuestion(ions)
        }
        else if (answer_button.getAttribute("counter") < 5) {
            status.innerHTML = `${answer.value} is incorrect. Try again.`
            answer_button.setAttribute("counter",  parseInt(answer_button.getAttribute("counter")) + 1)
        }
        else {
            status.innerHTML = `${questionAnswer} was the correct answer. Let's try another.`
            answer.disabled = true;
            answer_button.remove()
            newQuestion(ions)

        }
        
    
    
    })


    newForm.append(stem)
    newForm.append(answer)
    
    newForm.append(answer_button)

    setTimeout(() => {
        answer.focus();
    }, 10);
    


    const target = document.querySelector(".questions")
    target.appendChild(newForm)
    target.appendChild(status)
}
const ions = generateIons()
newQuestion(ions)





