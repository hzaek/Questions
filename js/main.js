let questionNumber = 0;
let done = false;
let points = new Set();
let inputsArr;
fetch("https://hzaek.github.io/Quiz-App/js/questions.json")
  .then((res) => {
    let a = res.json();
    return a;
  })
  .then((res) => {
    let myFitchedJson = res;
    createBalls(myFitchedJson);
    getQuestionsNumber(myFitchedJson);
    let myRandomJson;
    if (sessionStorage.getItem("first") === null) {
      myRandomJson = randomizer(myFitchedJson);
      sessionStorage.setItem("first", true);
      let stringifyRandom = JSON.stringify(myRandomJson);
      sessionStorage.setItem("stringifyRandom", stringifyRandom);
    } else {
      let stringifyRandom = sessionStorage.getItem("stringifyRandom");
      myRandomJson = JSON.parse(stringifyRandom);
      if (sessionStorage.getItem("questionNumber") !== null) {
        questionNumber = parseInt(sessionStorage.getItem("questionNumber"));
      }
      if (sessionStorage.getItem("ball") !== null) {
        let ball = document.querySelectorAll(".balls > li");
        for (let i = 0; i < ball.length; i++) {
          let parseBall = JSON.parse(sessionStorage.getItem(`ball${i}`));

          ball[i].classList.add(...parseBall);
        }
      }
      if (sessionStorage.getItem("points") !== null) {
        let pointsArr = JSON.parse(sessionStorage.getItem("points"));
        points = new Set(pointsArr);
      }
    }
    if (sessionStorage.getItem("inputs") !== null) {
      inputsArr = JSON.parse(sessionStorage.getItem("inputs"));
    } else {
      inputsArr = {};
    }
    // Refresh State

    upateTitle(myRandomJson, questionNumber);
    // Refresh State
    function createAnswers(arr, number) {
      let options = document.querySelector(".options");
      options.innerHTML = "";
      answersLength = arr[number].answers.length;
      for (let i = 0; i < answersLength; i++) {
        let label = document.createElement("label");
        label.className = "flex-1 bg-eee p-2 flex items-center gap-2";
        label.for = `option${i}`;
        let input = document.createElement("input");
        input.className = "w-5 h-5";
        input.id = `option${i}`;
        input.name = `question${number}`;
        input.type = "radio";
        label.append(input, arr[number].answers[i]);
        options.append(label);
      }
    }
    createAnswers(myRandomJson, questionNumber);
    // Questions Balls
    function createBalls(arr) {
      let balls = document.querySelector(".balls");

      for (let i in arr) {
        let li = document.createElement("li");
        li.className = `w-5 h-5 rounded-full bg-eee ball`;
        li.id = `ball${i}`;
        balls.append(li);
      }
      let ball = document.querySelectorAll(".balls > li");
      ball.forEach(function (el) {
        el.onclick = function () {
          ball.forEach(function (element) {
            element.classList.remove("active-ball");
          });
          this.classList.add("active-ball");
          questionNumber = parseInt([...this.id][4]);

          // Click Ball State
          sessionStorage.setItem("questionNumber", `${questionNumber}`);
          upateTitle(myRandomJson, questionNumber);
          createAnswers(myRandomJson, questionNumber);
          onSubmit(myRandomJson, questionNumber);
          saveBallClases();
          // Click Ball State
        };
      });
      let active = document.getElementById("ball0");
      if (sessionStorage.getItem("ball") === null) {
        active.classList.add("active-ball");
      }
    }

    function onSubmit(arr, questionNumber) {
      let submit = document.querySelector('input[type="submit"]');

      saveOptions(questionNumber);

      submit.onclick = function () {
        let options = document.querySelectorAll(".options > label");
        options.forEach(function (el, index) {
          if (el.firstChild.checked) {
            if (el.textContent === arr[questionNumber].trueAnswer) {
              el.id = `${questionNumber}${el.textContent}`;
              window.sessionStorage.setItem(
                `${questionNumber}`,
                `${el.textContent}`
              );

              points.add(el.id);
              let pointsArr = JSON.stringify([...points]);

              sessionStorage.setItem("points", `${pointsArr}`);
            }
            let ball = document.getElementById(`ball${questionNumber}`);
            ball.classList.add("done-ball");
            let balls = document.querySelectorAll(".done-ball");
            if (balls.length === arr.length) {
              let options = document.querySelector(".options");
              let title = document.querySelector(".title");
              Array.from(options.children).forEach((child) => {
                options.removeChild(child);
              });
              title.textContent = `You Got ${points.size} of ${balls.length}`;
              balls.forEach(function (el) {
                el.onclick = function () {
                  return;
                };
                let submit = document.querySelector('input[type="submit"]');
                submit.value = "Reset";
                submit.onclick = function () {
                  location.reload();
                };
              });

              sessionStorage.clear();
              done = true;
            } else {
              if (questionNumber + 1 === arr.length) {
                questionNumber = 0;
                let testball = document.querySelectorAll(".balls > li");

                while (
                  done === false &&
                  testball[questionNumber].classList.contains("done-ball")
                ) {
                  questionNumber += 1;
                }
                sessionStorage.setItem("questionNumber", `${questionNumber}`);
                let ballActive = document.getElementById(
                  `ball${questionNumber}`
                );
                ballActive.classList.add("active-ball");
                upateTitle(myRandomJson, questionNumber);
                createAnswers(myRandomJson, questionNumber);
                saveOptions(questionNumber);
              } else {
                questionNumber += 1;
                let testball = document.querySelectorAll(".balls > li");

                while (
                  done === false &&
                  testball[questionNumber].classList.contains("done-ball")
                ) {
                  console.log(questionNumber)
                  
                  questionNumber += 1
                  if (questionNumber === myFitchedJson.length){
                    questionNumber = 0
                  }
                }
                sessionStorage.setItem("questionNumber", `${questionNumber}`);
                let ballActive = document.getElementById(
                  `ball${questionNumber}`
                );
                ballActive.classList.add("active-ball");
                upateTitle(myRandomJson, questionNumber);
                createAnswers(myRandomJson, questionNumber);
                saveOptions(questionNumber);
              }
              saveBallClases(questionNumber);
            }
          }
        });
      };
    }
    // Submit State

    onSubmit(myRandomJson, questionNumber);
    saveOptions(questionNumber);
    timeFunc(5)
    // Submit State
  });

function getQuestionsNumber(arr) {
  let questionsCount = document.querySelector(".questionsCount");

  questionsCount.textContent = `Questions count: ${arr.length}`;
}

function randomizer(arr) {
  let rand = Math.floor(Math.random(arr.length) * arr.length);
  let mySet = new Set();
  while (mySet.size < arr.length) {
    mySet.add(arr[Math.floor(Math.random(arr.length) * arr.length)]);
  }
  let randomArray = [...mySet];
  return randomArray;
}

function upateTitle(arr, i) {
  let title = document.querySelector(".title");
  title.textContent = arr[i].title;
}

function saveBallClases(questionNumber) {
  let ball = document.querySelectorAll(".balls > li");
  let ballArr;
  for (let i = 0; i < ball.length; i++) {
    let ballArr = [...ball[i].classList];
    let stringifyBall = JSON.stringify(ballArr);
    sessionStorage.setItem(`ball${i}`, `${stringifyBall}`);
  }
  sessionStorage.setItem("ball", `true`);
}
// sessionStorage.clear()

function saveOptions(questionNumber) {
  let inputs = document.querySelectorAll(".options > label > input");

  if (sessionStorage.getItem("inputs") !== null && inputsArr[questionNumber]) {
    let selected = document.getElementById(inputsArr[questionNumber]);
    selected.setAttribute("checked", "");
  }
  inputs.forEach(function (el) {
    el.addEventListener("click", function (e) {
      inputsArr[questionNumber] = e.target.id;
      sessionStorage.setItem("inputs", JSON.stringify(inputsArr));
    });
  });
}
function timeFunc(min){

let timer = document.querySelector(".timer");
let startTime = new Date()
let testTime;
if (sessionStorage.getItem('timer') !== null){
    let iso = sessionStorage.getItem('timer')
    testTime = new Date(iso)
    let timeLeft = testTime - startTime
    let minutes = Math.floor(timeLeft / 1000 /60)
    if (minutes < 0){
      
        sessionStorage.clear()
        location.reload()
    }
}
if (sessionStorage.getItem('timer') === null){
    testTime = new Date(startTime.getTime() + (1000 * 60 * min))
}


sessionStorage.setItem('timer',testTime.toISOString())
let timeLeft = testTime - startTime
let minutes = Math.floor(timeLeft / 1000 /60)
let seconds = Math.floor(timeLeft / 1000)
let minSpan = document.querySelector('.minutes')
let secSpan = document.querySelector('.seconds')
let abc = setInterval(function(){
    
    let secondsLeft = (seconds) %60
    if (secondsLeft == 59){
        minutes -=1
    }
    seconds -=1
    if (secondsLeft < 10){
        secSpan.textContent = `0${secondsLeft}`
    }
    switch (true){
        case secondsLeft < 10 && minutes < 10:
            secSpan.textContent = `0${secondsLeft}`
            minSpan.textContent = `0${minutes}`
            break;
        case secondsLeft < 10 && minutes >= 10:
            secSpan.textContent = `0${secondsLeft}`
            minSpan.textContent = `${minutes}`
            break;
        case secondsLeft >= 10 && minutes < 10:
            secSpan.textContent = `${secondsLeft}`
            minSpan.textContent = `0${minutes}`
            break;
        default:
            secSpan.textContent = `${secondsLeft}`
            minSpan.textContent = `${minutes}`
    }
   if (minutes <= 0 && secondsLeft == 0){
    let balls = document.querySelectorAll(".balls > li");
    console.log('hi')
    let options = document.querySelector(".options");
    let title = document.querySelector(".title");
    Array.from(options.children).forEach((child) => {
      options.removeChild(child);
    });
    title.textContent = `You Got ${points.size} of ${balls.length}`;
    balls.forEach(function (el) {
      el.onclick = function () {
        return;
      };
      let submit = document.querySelector('input[type="submit"]');
      console.log(submit)
      submit.value = "Reset";
      submit.onclick = function () {
        location.reload();
      };
    });

    sessionStorage.clear();
    done = true;
    clearInterval(abc)
   }

},1000)


}
